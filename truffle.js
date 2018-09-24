require('babel-register')

const web3_utils       = require('web3-utils')
const HDWalletProvider = require('truffle-hdwallet-provider-privkey')

const path   = require('path')
const paths  = require(path.join(process.cwd() , '/package.json')).paths.truffle

const remove0x = el => (typeof el !== 'undefined' && el.length > 2 && el.substr(0, 2) === '0x')
  ? el.substr(2)
  : el

process.env.PRIVKEY = (process.env.DC_NETWORK === 'ropsten') &&
 remove0x(process.env.PRIVKEY) || remove0x(require('./secrets.json').ropsten.privkey)


module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 1406,
      network_id: '*'
    },
    ropsten: {
      provider: new HDWalletProvider([process.env.PRIVKEY], 'https://ropsten.infura.io/v3/ddcb560cc5914992be33aa2aa7dd8e20'),
      gas: 4200000,
      gasPrice: web3_utils.toWei('20', 'gwei'),
      network_id: 3
    }
  },

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },

  contracts_directory:       paths.contracts_directory  || './contracts',
  migrations_directory:      paths.migrations_directory || './migrations',
  contracts_build_directory: path.join(process.cwd(), (paths.contracts_build_directory || './build'))
}
