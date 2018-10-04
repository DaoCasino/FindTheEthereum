// Set global DCLib network config
window.DCLIB_CONFIG = {
  network: 'local',
  rpc_url: 'http://127.0.0.1:1406',

  // signal : '/ip4/0.0.0.0/tcp/1407/ws/p2p-websocket-star/',
  dappRoom : process.env.DAPP_ROOM || '',

  tx_confirmations : 2,

  gasPrice : process.env.DAPP_gasPrice * 1,
  gasLimit : process.env.DAPP_gasLimit * 1,

  contracts: {
    erc20: {
      address: require('./addresses.json').ERC20,
      abi: require('./contracts/ERC20.json').abi
    }
  }
}

if (process.env.DAPP_DC_NETWORK === 'ropsten') {
  window.DCLIB_CONFIG = {
    network: 'ropsten',
    rpc_url: 'https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl'
  }
}

export default window.DCLIB_CONFIG
