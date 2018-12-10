import DCWebapi from "dc-webapi"
import Main from './src/main.js'

document.addEventListener('DOMContentLoaded', async () => {
  // YOUR PRIVATE KEY (HAVE TOKEN BET)
  let privkey = "0xaa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7"
  let network = "ropsten"
  window.webapi = await new DCWebapi({
    blockchainNetwork: network,
    platformId: "DC_CloudPlatform"
  }).start()
  await window.webapi.account.init("1111", privkey)
  new Main()
})
