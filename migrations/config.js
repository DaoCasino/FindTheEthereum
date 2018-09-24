const path = require('path')

const root = (process.env.PWD || '../')+'/'

const paths     = require(path.join(root , '/package.json')).paths
const protocol  = path.resolve(root + '_env/protocol/')
const contracts = path.resolve(protocol + '/contracts/')
const dapp_abi  = path.resolve( root + paths.dapp.contract_abi )

module.exports = function(network=false){
  let addresses = require(path.resolve(protocol + '/addresses.json'))
  
  if (network === 'ropsten') {
    addresses = {
      ERC20:    '0x5D1E47F703729fc87FdB9bA5C20fE4c1b7c7bf57',
      Referrer: '0x674ff87adfe928b8b0ffbbddf7faeb5ae7a1f9d6',
      GameWL:   '0x19dbd1984278e70ab11dbdfb079d810f986db3fe',
      PlayerWL: '0xbc993df3cf69018a17234326e0e02fc11ed35264',
      RSA:      '0x214c3e2505d47e01f286b97ec6779b149cab65f7'
    }
  }

  return {
    paths : paths,
    dapp  : {
      contract_abi: dapp_abi
    },

    infura:{
      ropsten:{
        provider:'https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl'
      }
    },
    
    protocol : {
      addresses : addresses,
      contracts : contracts,
    },
  }
}
