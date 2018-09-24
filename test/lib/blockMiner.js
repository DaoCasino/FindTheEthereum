const BlockMiner = artifacts.require('BlockMiner')

module.exports = function (addr, numBlocksToMine) {
  return new Promise(async function (resolve) {
    const blockMiner = await BlockMiner.deployed()
    let miners = []
    for (let ii = 0; ii < numBlocksToMine; ii++) {
      miners.push(blockMiner.mine({from: addr}))
    }
    return Promise.all(miners).then(resolve)
  })
}
