const addressFunctions = {
  rinkeby: () => "0xCD184E71b763d86d4766cbA902B0d34DF4BA0c16",
  ropsten: () => "0x76acfE4A87381E6Ff1B5c68d404CD49837f53184",
  mainnet: () => "",
  local: () => "contracts->Game"
}

module.exports = {
  slug: "DCGame_FTE_v1",
  logic: "./dapp.logic.js",
  about: "./README.md",

  getContract: blockchainNetwork => ({
    address: addressFunctions[blockchainNetwork]()
  }),

  rules: {
    depositX: 2
  }
}
