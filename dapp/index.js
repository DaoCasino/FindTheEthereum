import DCWebapi from "@daocasino/dc-webapi"
import Main from './src/main.js'

document.addEventListener('DOMContentLoaded', async () => {
  const params = {
    platformId: 'DC_CloudPlatform',
    blockchainNetwork: 'ropsten',
    privateKey: '0x92c9bb55d346f4a79bb7f7c4a961d99c2bf9ea36193d442d824bd7844cee6753'
  }
  const webapi = new DCWebapi(params)
  const { account, game } = await webapi.init()
  window.account = account
  window.game = game
  new Main()
})