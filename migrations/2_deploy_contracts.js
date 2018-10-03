const myDAppGame = artifacts.require('./myDAppGame.sol')
const Miner      = artifacts.require('./tools/BlockMiner.sol')

module.exports = async (deployer, network) => {
  const addr = require('./config.js')(network).protocol.addresses

  await deployer.deploy(
    myDAppGame,
    addr.ERC20,    // ERC20Interface _token       ,
    addr.Referrer, // RefInterface _ref           ,
    addr.GameWL,   // GameWLinterface _gameWL     ,
    addr.PlayerWL, // PlayerWLinterface _playerWL ,
    addr.RSA       // RSA _rsa
  )
  console.log('myDAppGame address:', myDAppGame.address)

  if (
    network === 'development' ||
    network === 'develop' ||
    network === 'coverage'
  ) {
    await deployer.deploy(Miner)
  }

  console.log('>>> Deploy complete <<<')
}

