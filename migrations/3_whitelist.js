/* global artifacts web3 */
const path   = require('path')


module.exports = async function (deployer, network, accounts) {
  if (network === 'ropsten' || network === 'ropsten-fork') return

  const config = require('./config.js')(network)
  const addr   = config.protocol.addresses

  const myDAppGame = artifacts.require('./myDAppGame.sol')

  const GameWL   = new web3.eth.Contract(require(path.resolve(config.protocol.contracts + '/GameWL.json')).abi, addr.GameWL   )
  const PlayerWL = new web3.eth.Contract(require(path.resolve(config.protocol.contracts + '/PlayerWL.json')).abi, addr.PlayerWL )

  const opts = {
    gas      : 5500000,
    from     : accounts[0],
    gasPrice : 10000000000
  }

  await GameWL.methods.addGame(myDAppGame.address)
    .send(opts)
    .on('error', error => console.log('error', error))
    .on('transactionHash', transactionHash => console.log('transactionHash', transactionHash))
    .on('receipt', receipt => console.log('receipt', receipt))
    .on('confirmation', function (confirmationNumber, receipt) {
      (confirmationNumber < 3) && console.log('confirmationNumber', confirmationNumber)
    })

  const amount = web3.utils.toWei('1000')
  PlayerWL.methods.setAmountForPlayer(accounts[0], amount).send(opts)
  PlayerWL.methods.setAmountForPlayer(accounts[1], amount).send(opts)
  PlayerWL.methods.setAmountForPlayer(accounts[2], amount).send(opts)
}
