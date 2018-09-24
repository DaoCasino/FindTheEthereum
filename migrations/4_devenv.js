const fs     = require('fs')


const myDAppGame = artifacts.require('./myDAppGame.sol')

module.exports = function (deployer, network) {
  const config = require('./config.js')(network)
  
  fs.writeFileSync(config.dapp.contract_abi, JSON.stringify({
    address : myDAppGame.address,
    abi     : myDAppGame.abi
  }))
}

