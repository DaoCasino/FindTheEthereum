/* global init */
import 'config/dclib'
import SW from 'ServiceWorker/SW'

console.groupCollapsed('⚙︎ ENV Settings');
console.table(process.env);
console.groupEnd();

function loadLib() {
    //console.log('DCLib.web3.version:', DCLib.web3.version)
    //console.log("DC_NETWORK:", process.env.DC_NETWORK);
    if (process.env.DC_NETWORK !== 'ropsten') {
        DCLib.Account.create('0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c', '1234')
    }

    if (window.DApp && window.DApp.web3) {
        console.warn('Dapp allready created')
    } else {
        let dapp_config = {
            slug: process.env.DAPP_SLUG,
            contract: require('config/dapp.contract.json'),
            rules: {
                depositX: 2
            }
        }
        window.DApp = new DCLib.DApp(dapp_config)
    }

    init();
}

document.addEventListener('DCLib::ready', loadLib);

// Register Service Worker
if (process.env.DAPP_SW_ACTIVE) SW.register()