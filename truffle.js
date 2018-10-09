const HDWalletProvider = require('truffle-hdwallet-provider')

const path   = require('path')
const paths  = require(path.join(process.cwd(), '/package.json')).paths.truffle

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 1406,
      network_id: '*'
    },
    ropsten: {
      gas           : 5500000,
      gasPrice      : 10000000000,
      provider      : new HDWalletProvider(process.env.MNEMONIC || require('./secrets.json').ropsten.mnemonic, 'https://ropsten.infura.io'),
      network_id    : 3,
      skipDryRun    : true,
      timeoutBlocks : 200
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
