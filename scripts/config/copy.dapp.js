const webpack = require('webpack')
const env     = require('./env')('')
const fs      = require('fs')
const path    = require('path')
const paths   = require('./paths')


module.exports = {
  copyDappFiles: function (loc) {
    loc = loc || './config'
    let dapp_slug = '' 
    try {
      dapp_slug = require(loc+'/env')('').raw.DAPP_SLUG
    } catch(e){
      console.error('Cant read DAPP_SLUG option in .env file');
      console.error('Please check this');
      throw e
    }

    // Logic
    let l = fs.readFileSync(paths.DappLogic,'utf8')
              .split('process.env.DAPP_SLUG')
              .join( "'"+dapp_slug+"'" )
    fs.writeFileSync(paths.appBuild+'/'+paths.DappLogic.split('/').slice(-1), l)


    const root = (process.env.PWD || '../')+'/'
    let contract_data, dapp_abi_path
    try {
      dapp_abi_path = require(path.join(root , '/package.json')).paths.dapp.contract_abi
      contract_data = require(root+dapp_abi_path)
    } catch(e){
      console.error('ERR: Cant find dapp contarct abi in '+dapp_abi_path, e)
    }
    
    let p = dapp_abi_path.replace('./dapp/','./')

    // Manifest
    let m = fs.readFileSync(paths.DappManifest,'utf8')
              .split('process.env.DAPP_SLUG')
              .join( "'"+dapp_slug+"'" )
              .split("require('"+p+"')")
              .join( JSON.stringify(contract_data) )
              .split('require("'+p+'")')
              .join( JSON.stringify(contract_data) )

    fs.writeFileSync(paths.appBuild+'/'+paths.DappManifest.split('/').slice(-1), m)
  },

  webpack : [
    {
      name: "dapp_logic",
      entry: paths.DappLogic,
      output: {
        path: paths.appBuild,
        filename: "dapp.logic.js"
      },
      plugins: [
        new webpack.DefinePlugin(env.stringified),
      ]
    }
  ]
}
