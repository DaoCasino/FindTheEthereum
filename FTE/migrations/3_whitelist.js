/* global artifacts web3 */
const path   = require('path')


module.exports = async function (deployer, network) {
  const config = require('./config.js')(network)
  const addr   = config.protocol.addresses

  const WEB3 = (!process.env.DC_NETWORK && process.env.DC_NETWORK !== 'ropsten')
    ? new (require('web3'))(web3.currentProvider)
    : new (require('web3'))(new web3.providers.HttpProvider(config.infura.ropsten.provider))

  const myDAppGame = artifacts.require('./myDAppGame.sol')

  const GameWL   = new WEB3.eth.Contract(require(path.resolve(config.protocol.contracts + '/GameWL.json')).abi   , addr.GameWL   )
  const PlayerWL = new WEB3.eth.Contract(require(path.resolve(config.protocol.contracts + '/PlayerWL.json')).abi , addr.PlayerWL )
 
  let address = false
  if (process.env.DC_NETWORK === 'ropsten') {
    address = WEB3.eth.accounts
      .privateKeyToAccount('0x' + process.env.PRIVKEY).address

    WEB3.eth.accounts.wallet.add(
      WEB3.eth.accounts.privateKeyToAccount('0x' + process.env.PRIVKEY)
    )
  } else {
    address = web3.eth.accounts[0]
  }

  const opts = {
    from     : address,
    gas      : 6700000,
    gasPrice : 22000000000
  };

  (await GameWL.methods.addGame(myDAppGame.address)
    .send(opts)
    .on('error', function (error) {
      console.log('error', error)
    })
    .on('transactionHash', function (transactionHash) { console.log('transactionHash', transactionHash) })
    .on('receipt', function (receipt) {
      console.log('receipt',receipt)
    })
    .on('confirmation', function (confirmationNumber, receipt) {
      if (confirmationNumber < 3) console.log('confirmationNumber', confirmationNumber)
    })
    .then(function (res) {
      console.log('res', res)
    })
    .catch(function (err) {
      throw new Error(false, err)
    }))

  const amount = WEB3.utils.toWei('1000')
  if (!process.env.DC_NETWORK && process.env.DC_NETWORK !== 'ropsten') {
    PlayerWL.methods.setAmountForPlayer(web3.eth.accounts[0], amount).send(opts)
    PlayerWL.methods.setAmountForPlayer(web3.eth.accounts[1], amount).send(opts)
    PlayerWL.methods.setAmountForPlayer(web3.eth.accounts[2], amount).send(opts)
  } else {
    PlayerWL.methods.setAmountForPlayer(address, amount).send(opts)
  }
}
