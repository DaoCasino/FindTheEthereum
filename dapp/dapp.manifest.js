export default {
  'slug'  : process.env.DAPP_SLUG,

   // if you want to change filename  - change it too in /scripts/config/paths
  'logic' : './dapp.logic.js',

  'about' : './README.md',

  'contract': require('./config/dapp.contract.json'),

  'rules': {
    'depositX' : 2
  }
}
