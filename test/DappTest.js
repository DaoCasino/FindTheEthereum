/* global contract before describe it assert */

const myDAppGame = artifacts.require('myDAppGame')
const web3_1  = require('web3')
const web3js  = new web3_1(web3.currentProvider)
const { expectThrow } = require('./lib/index.js')

contract('Game test', function () {

  var myGame

  before('setup contract', async function () {
    myGame = await myDAppGame.deployed()
  })

  describe('game function test', function () {
    it('valid game data', async function () {
      // set game data
      let gameData = [1]
      let bet = 10
      let sigseed = web3js.utils.randomHex(64) // random

      // run function
      let result = await myGame.game(gameData, bet, sigseed)
      let win = result[0]
      let profit = win ? result[1].toNumber() : -result[1].toNumber()
      console.log(`win: ${win} profit: ${profit}`)
    })

    it('invalid game data', async function () {
      // set game data
      let gameData = [4]
      let bet = 10
      let sigseed = web3js.utils.randomHex(64) // random

      // run function
      await expectThrow(myGame.game(gameData, bet, sigseed))
    })
  })

  describe('check game data function test', function () {
    it('valid gameData', async function () {
      let gameData = [1]
      let bet = 10
      let result = await myGame.checkGameData(gameData, bet)
      assert.isOk(result, 'invalid gameData')
    })

    it('invalid game data', async function () {
      // set game data
      let gameData = [0]
      let bet = 0

      // run function
      await expectThrow(myGame.checkGameData(gameData, bet))
    })
  })

  describe('profit calc function test', function () {
    it('valid calculation', async function () {
      let gameData = [1]
      let bet = 10
      let result = await myGame.getProfit(gameData, bet)
      assert.equal(bet * gameData[0], result.toNumber(), 'invalid calculation')
    })
    it('invalid calculation', async function () {
      let gameData = [1]
      let bet = 10
      let result = await myGame.getProfit(gameData, bet)
      assert.notEqual(bet * 100, result.toNumber(), 'invalid calculation')
    })
  })

})
