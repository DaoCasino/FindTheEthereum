//import 'config/dclib'

//import SW from 'ServiceWorker/SW'

//import MyDApp from 'app'

//import 'view/main'

console.groupCollapsed('⚙︎ ENV Settings')
console.table(process.env)
console.groupEnd()

/*
document.addEventListener('DCLib::ready', e => {
  console.groupCollapsed('DCLib config')
  console.table( DCLib.config )
  console.groupEnd()
  console.log('DCLib.web3.version:', DCLib.web3.version)

  if (process.env.DC_NETWORK !== 'ropsten') {
    DCLib.Account.create('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', '1234')
  }

  MyDApp.init({
    slug: process.env.DAPP_SLUG,
    contract: require('config/dapp.contract.json'),
    rules: {
      depositX : 2
    }
  })

})*/


// Register Service Worker
//if (process.env.DAPP_SW_ACTIVE) SW.register()
