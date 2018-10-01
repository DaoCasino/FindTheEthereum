const myDAppGame = artifacts.require('./myDAppGame.sol')
const Miner      = artifacts.require('./tools/BlockMiner.sol')

module.exports = function (deployer, network) {
  const addr  = require('./config.js')(network).protocol.addresses
  
  /*
      contract myDAppGame is oneStepGame { constructor (
  */
  deployer.deploy(
    myDAppGame ,
      addr.ERC20    , // ERC20Interface _token       ,
      addr.Referrer , // RefInterface _ref           ,
      addr.GameWL   , // GameWLinterface _gameWL     ,
      addr.PlayerWL , // PlayerWLinterface _playerWL ,
      addr.RSA       // RSA _rsa
  ).then(function () {
    console.log('myDAppGame address:', myDAppGame.address);
    if (network === 'development' || network === 'develop' || network === 'coverage') {
      return deployer.deploy(Miner)
    }
    return true
  }).then(function () {
    console.log('>>> Deploy complete <<<')
  })
}

