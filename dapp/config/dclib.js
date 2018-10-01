// Set global DCLib network config
window.DCLIB_CONFIG = {
  network: 'local',
  // rpc_url: 'http://127.0.0.1:1406',
  rpc_url: 'https://ganache-cli.stage.dao.casino',

  contracts: {
    erc20: {
      address: require('protocol/addresses.json').ERC20,
      abi: require('protocol/contracts/ERC20.json').abi
    }
  }
}

if (process.env.DC_NETWORK === 'ropsten') {
  window.DCLIB_CONFIG = {
    network: 'ropsten',
    rpc_url: 'https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl'
  }
}

export default window.DCLIB_CONFIG
