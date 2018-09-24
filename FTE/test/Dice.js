const path    = require('path')
const web3_1  = require('web3')
const web3js  = new web3_1(web3.currentProvider)
const account = require('web3-eth-accounts/node_modules/eth-lib/lib/account.js')

const { DCRSa, expectThrow, arrToChannel, Mine } = require('./lib/index.js')

const config = require('../migrations/config.js')('development')


const myDAppGame = artifacts.require('myDAppGame')
const GameWL     = new web3js.eth.Contract(require(path.resolve(config.protocol.contracts + '/GameWL.json')).abi   , config.protocol.addresses.GameWL   )
const PlayerWL   = new web3js.eth.Contract(require(path.resolve(config.protocol.contracts + '/PlayerWL.json')).abi , config.protocol.addresses.PlayerWL   )
const ERC20      = new web3js.eth.Contract(require(path.resolve(config.protocol.contracts + '/ERC20.json')).abi    , config.protocol.addresses.ERC20   )
const RSA        = new web3js.eth.Contract(require(path.resolve(config.protocol.contracts + '/RSA.json')).abi      , config.protocol.addresses.RSA   )

// for using web3 v1.0-beta
const privKeys = [
  '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
  '0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',
  '0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c',
  '0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
  '0x659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63',
  '0x82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8',
  '0xaa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7',
  '0x0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4',
  '0x8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5'
]

var owner      = web3js.eth.accounts.privateKeyToAccount(privKeys[0])
var player     = web3js.eth.accounts.privateKeyToAccount(privKeys[1])
var bankroller = web3js.eth.accounts.privateKeyToAccount(privKeys[2])
var hacker     = web3js.eth.accounts.privateKeyToAccount(privKeys[3])


contract('Dice test', function (accounts) {

  const BET = 10 ** 18

  before('setup contract', async function () {
    myGame = await myDAppGame.deployed()
  })
    /*
    Init environment:
    - add game and player to whitelist
    - sent ERC20
    - approve
    - generate RSA keys
    */
  describe('init', function () {

    describe('add game to whitelist', function () {

      it('add game', function () {
        console.log(`OWNER: ${owner.address} ACC: ${accounts[0]}`)
        GameWL.methods.addGame(Dice.address, {
          from: owner.address
        })
      })

      it('check game', async function () {
        let status = await GameWL.methods.getStatus.call(Dice.address)
        assert.isOk(status, 'Game is not in whitelist')
      })
    })

    describe('add player to whitelist', function () {

      it('add player', function () {
        PlayerWL.methods.setAmountForPlayer(player.address, 1000 * BET, {
          from: owner.address
        })
      })

      it('check player', async function () {
        let amount = await PlayerWL.methods.getMaxAmount.call(player.address)
        assert.equal(amount.toNumber(), 1000 * BET, 'Player is not ready')
      })
    })

    describe('faucet', function () {

      it('get BET for player', function () {
        ERC20.methods.faucet({
          from: player.address
        })
      })

      it('check player balance', async function () {
        let balance = await ERC20.methods.balanceOf.call(player.address)
        assert.equal(balance.toNumber(), 100 * BET, 'faucet fail')
      })

      it('get BET for bankroller', function () {
        ERC20.methods.faucet({
          from: bankroller.address
        })
      })

      it('check bankroller balance', async function () {
        let balance = await ERC20.methods.balanceOf.call(bankroller.address)
        assert.equal(balance.toNumber(), 100 * BET, 'faucet fail')
      })
    })

    describe('approve', function () {

      it('Approve from player', function () {
        ERC20.methods.methods.approve(Dice.address, 100 * BET, {
          from: player.address
        })
      })

      it('check allowed from player', async function () {
        let allowance = await ERC20.methods.allowance.call(player.address, Dice.address)
        assert.equal(allowance, 100 * BET, 'no approve from player')
      })

      it('Approve from bankroller', function () {
        ERC20.methods.approve(Dice.address, 100 * BET, {
          from: bankroller.address
        })
      })

      it('check allowed from bankroller', async function () {
        let allowance = await ERC20.methods.allowance.call(bankroller.address, Dice.address)
        assert.equal(allowance, 100 * BET, 'no approve from player')
      })

    })

    describe('generate RSA keys', function () {
      bankroller.RSA = new DCRSa()
      player.RSA = new DCRSa()

      it('generate private key for bankroller', function () {
        this.timeout(10000)
        bankroller.RSA.generate()
        if (bankroller.RSA.RSA.n.t > 10) {
          assert(true)
        } else assert(false)
      })

      it('generate bankroller public key for player', function () {
        player.RSA.create(bankroller.RSA.RSA.n.toString(16))
        if (player.RSA.RSA.n.t > 10) {
          assert.isOk(true)
        } else assert.isOk(false)

      })

    })

  })


  describe('game contract tests', function () {

    describe('checkGameData test', async function () {

      it('valid data and bet', async function () {
        let result = await myGame.checkGameData.call([1000], 1000)
        assert.isOk(result, 'valid data')
      })

      it('invalid bet', async function () {
        await expectThrow(myGame.checkGameData.call([1000], 0))
        await expectThrow(myGame.checkGameData.call([1000], 1000 ** 18))
      })

      it('invalid data', async function () {
        await expectThrow(myGame.checkGameData.call([66000], 1000))
        await expectThrow(myGame.checkGameData.call([0], 1000))
      })
      it('invalid data and bet', async function () {
        await expectThrow(myGame.checkGameData.call([66000], 1000))
        await expectThrow(myGame.checkGameData.call([0], 1000))
        await expectThrow(myGame.checkGameData.call([1000], 0))
        await expectThrow(myGame.checkGameData.call([1000], 1000 ** 18))
      })
    })

    describe('random generate test', function () {

      it('valid maximum', async function () {
        var result = await myGame.generateRnd.call(web3js.utils.randomHex(32), 0, 65536)
        assert.equal(result, result, 'invalid result')
      })

      it('invalid maximum', function () {
        expectThrow(myGame.generateRnd.call(web3js.utils.randomHex(32), 0, 2 ** 129))
      })
    })

    describe('game function test', async function () {

      it('game', async function () {
        let result = await myGame.game.call([64225], 1000, web3js.utils.randomHex(32))
        assert.isOk(result[0], 'lose')
        assert.equal(result[1].toNumber(), 20, 'invalid profit')
      })

      it('game', async function () {
        let result = await myGame.game.call([2], 1000, web3js.utils.randomHex(32))
        assert.isNotOk(result[0], 'win')
        assert.equal(result[1].toNumber(), 1000, 'invalid profit')
      })

    })

    describe('profit calculate test', function () {
      it('calculate', async function () {
        let _bet = 1000
        let _playerNumber = 33331

        let result = await myGame.getProfit.call([_playerNumber], _bet)
        let jscalculate = (_bet * (65535 / _playerNumber)) - _bet
        assert.equal(result.toNumber(), Math.floor(jscalculate), 'invalid calculate')
      })
    })

  })

    /*
    Scenario #1:
    - Testing only payment channels functional
    */
  describe('>>> scenario #1:', function () {

    let id, session, openingBlock, gameData, playerBalance, bankrollerBalance, totalBet, _E, _N
    let channel = {}

    before('init data', function () {
      _E = '0x0' + player.RSA.RSA.e.toString(16)
      _N = '0x' + player.RSA.RSA.n.toString(16)
    })

    describe('Player open channel', function () {

      before('init opening data', async function () {
        session = 0
        id = web3js.utils.randomHex(32)
        openingBlock = await web3js.eth.getBlockNumber()
        gameData = [0]
        playerBalance = 1000
        bankrollerBalance = 20000
        console.log('>>>>!', openingBlock)
      })

      it('Player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let data = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(data, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(data, sign)

        assert.equal(bankroller.address, signer, 'bankroller is not a signer')
        channel.bankrollerSign = sign
      })

      it('REVERT> Hacker open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: hacker.address
                        }
                    )
                )
      })

      it('REVERT> Invalid sign open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.playerSign, {
                          from: player.address
                        }
                    )
                )
      })

      it('Sent open Tx', function () {
        myGame.openChannel(
                    id,
                    player.address,
                    bankroller.address,
                    playerBalance,
                    bankrollerBalance,
                    openingBlock,
                    gameData,
                    _N,
                    _E,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)

        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())

      })

      it('REVERT> double opening', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })

    })

    describe('update channel', function () {

      before('update info', function () {
        session++
        playerBalance = 2000
        bankrollerBalance = 19000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent update transaction', function () {
        myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        assert.equal(channel.session, session)
      })

    })

    describe('REVERT> Hacker update channel', function () {

      before('update info', function () {
        session++
        playerBalance = 3000
        bankrollerBalance = 18000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: hacker.address
                    }
                ))
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        assert.equal(channel.session, session - 1)
      })

    })

    describe('close channel', function () {

      before('update info', function () {
        session++
        playerBalance = 11000
        bankrollerBalance = 10000
        totalBet = 2000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'bool',
          v: true
        })
        sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'bool',
          v: true
        })
        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign

      })

      it('sent closing transaction', function () {
        myGame.closeByConsent(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    true,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )

      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'close', 'close channel')
        assert.equal(channel.playerBalance, 0, 'player balance')
        assert.equal(channel.bankrollerBalance, 0, 'bankroller balance')
        assert.equal(channel.session, session, 'session fail')
      })
    })

    describe('REVERT> update channel after the closure', function () {

      before('update info', function () {
        session++
        playerBalance = 3000
        bankrollerBalance = 18000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('hacker sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: hacker.address
                    }
                ))
      })

      it('player sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                ))
      })

      it(' bankroller sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: bankroller.address
                    }
                ))
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'close', 'invalid state')
      })

    })

    describe('REVERT> reopening the channel', function () {

      it('Sent open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })
    })

  })

    /*
    Scenario #2:
    - Testing only payment channels functional
    - closing by timeout
    */
  describe('>>> scenario #2:', function () {

    let id, session, openingBlock, gameData, playerBalance, bankrollerBalance, totalBet, _E, _N
    let channel = {}

    before('init data', function () {
      _E = '0x0' + player.RSA.RSA.e.toString(16)
      _N = '0x' + player.RSA.RSA.n.toString(16)
    })

    describe('Player open channel', function () {

      before('init opening data', async function () {
        session = 0
        id = web3js.utils.randomHex(32)
        openingBlock = await web3js.eth.getBlockNumber()
        gameData = [0]
        playerBalance = 1000
        bankrollerBalance = 20000
        console.log('>>>>!', openingBlock)
      })

      it('Player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let data = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(data, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(data, sign)

        assert.equal(bankroller.address, signer, 'bankroller is not a signer')
        channel.bankrollerSign = sign
      })

      it('REVERT> Hacker open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: hacker.address
                        }
                    )
                )
      })

      it('REVERT> Invalid sign open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.playerSign, {
                          from: player.address
                        }
                    )
                )
      })

      it('Sent open Tx', function () {
        myGame.openChannel(
                    id,
                    player.address,
                    bankroller.address,
                    playerBalance,
                    bankrollerBalance,
                    openingBlock,
                    gameData,
                    _N,
                    _E,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)

        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        console.log(channel.endBlock)

      })

      it('REVERT> double opening', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })

    })

    describe('update channel', function () {

      before('update info', function () {
        session++
        playerBalance = 2000
        bankrollerBalance = 19000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent update transaction', function () {
        myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        assert.equal(channel.session, session)
        console.log(channel.endBlock)
      })

    })

    describe('REVERT> Hacker update channel', function () {

      before('update info', function () {
        session++
        playerBalance = 3000
        bankrollerBalance = 18000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: hacker.address
                    }
                ))
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        assert.equal(channel.session, session - 1)
      })

    })

    describe('block miner', function () {
      it('mine block', async function () {
        let currentBlock = await web3js.eth.getBlockNumber()
        console.log(currentBlock)
        await Mine(owner.address, 160)
        currentBlock = await web3js.eth.getBlockNumber()
        console.log(currentBlock)
      })
    })

    describe('close channel by timeout', function () {

      it('check block', async function() {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        let currentBlock = await web3js.eth.getBlockNumber()
        assert.isOk(channel.endBlock < currentBlock, 'invalid block')
      })

      it('close by timeout', function () {
        myGame.closeByTime(id, {from: player.address})
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'close','channel is open')
        assert.equal(channel.playerBalance, 0, 'player balance != 0')
        assert.equal(channel.bankrollerBalance, 0, 'bankroller balance != 0')
      })
    })

    describe('REVERT> update channel after the closure', function () {

      before('update info', function () {
        session++
        playerBalance = 3000
        bankrollerBalance = 18000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('hacker sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: hacker.address
                    }
                ))
      })

      it('player sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                ))
      })

      it(' bankroller sent update transaction', function () {
        expectThrow(myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: bankroller.address
                    }
                ))
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'close', 'invalid state')
      })

    })

    describe('REVERT> reopening the channel', function () {

      it('Sent open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })
    })

  })

    /*
    Scenario #3:
    - Testing game channels functional
    */
  describe('>>> scenario #3:', function () {
    let id, session, ttl_block, gameData, playerBalance, bankrollerBalance, totalBet, _E, _N
    let bet, seed, rnd
    let channel = {}
    let lastResult = {}

    before('init data', function () {
      totalBet = 100
      _E = '0x0' + player.RSA.RSA.e.toString(16)
      _N = '0x' + player.RSA.RSA.n.toString(16)
    })

    describe('Player open channel', function () {

      before('init opening data', async function () {
        session = 0
        id = web3js.utils.randomHex(32)
        openingBlock = await web3js.eth.getBlockNumber()
        gameData = [0]
        playerBalance = 1000
        bankrollerBalance = 20000
        console.log('>>>>!', openingBlock)
      })

      it('Player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let data = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(data, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(data, sign)

        assert.equal(bankroller.address, signer, 'bankroller is not a signer')
        channel.bankrollerSign = sign
      })

      it('REVERT> Hacker open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: hacker.address
                        }
                    )
                )
      })

      it('REVERT> Invalid sign open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.playerSign, {
                          from: player.address
                        }
                    )
                )
      })

      it('Sent open Tx', function () {
        myGame.openChannel(
                    id,
                    player.address,
                    bankroller.address,
                    playerBalance,
                    bankrollerBalance,
                    openingBlock,
                    gameData,
                    _N,
                    _E,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)

        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())

      })

      it('REVERT> double opening', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })

    })

    describe('game round', function () {

      before('generate game data', function () {
        gameData = [42000]
        bet = 10
        seed = web3js.utils.randomHex(32)
        session++
      })

      it('sign data from player', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'uint',
          v: bet
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes32',
          v: seed
        })
        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSignGame = sign
      })

      it('sign data from bankroller', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'uint',
          v: bet
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes32',
          v: seed
        })
        let rsaSign = bankroller.RSA.signHash(dataHash).toString(16)
        assert.isOk(player.RSA.verify(dataHash, rsaSign))
        channel.RSASign = rsaSign
      })

      it('generate rnd', async function () {
        rnd = await myGame.generateRnd.call(channel.RSASign, 1, 65535)
      })

      it('game', async function () {
        let result = await myGame.game.call(gameData, bet, rnd)
        lastResult.win = Boolean(result[0])
        lastResult.value = result[1].toNumber()

      })

      it('offchain update channel', function () {
        if (lastResult.win) {
          playerBalance += lastResult.value
          bankrollerBalance -= lastResult.value
        } else {
          playerBalance -= lastResult.value
          bankrollerBalance += lastResult.value
        }
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: session
        })
        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: session
        })
        let sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

    })

    describe('close channel', function () {

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'bool',
          v: true
        })
        sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'bool',
          v: true
        })
        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent closing transaction', function () {
        myGame.closeByConsent(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    true,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'close', 'invalid state')
        assert.equal(channel.playerBalance, 0, 'player balance')
        assert.equal(channel.bankrollerBalance, 0, 'bankroller balance')
        assert.equal(channel.session, session, 'session fail')
      })
    })
  })

    /*
    Scenario #4:
    - Player opens the dispute
    - Bankroller closes the dispute
    */
  describe('>>> scenario #4:', function () {
    var id, session, ttl_block, gameData, playerBalance, bankrollerBalance, totalBet, _E, _N
    var bet, seed, rnd
    var channel = {}
    var lastResult = {}

    before('init data', function () {
      totalBet = 100
      _E = '0x0' + player.RSA.RSA.e.toString(16)
      _N = '0x' + player.RSA.RSA.n.toString(16)
    })

    describe('Player open channel', function () {

      before('init opening data', async function () {
        session = 0
        id = web3js.utils.randomHex(32)
        openingBlock = await web3js.eth.getBlockNumber()
        gameData = [0]
        playerBalance = 1000
        bankrollerBalance = 20000
        console.log('>>>>!', openingBlock)
      })

      it('Player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let data = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(data, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(data, sign)

        assert.equal(bankroller.address, signer, 'bankroller is not a signer')
        channel.bankrollerSign = sign
      })

      it('REVERT> Hacker open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: hacker.address
                        }
                    )
                )
      })

      it('REVERT> Invalid sign open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.playerSign, {
                          from: player.address
                        }
                    )
                )
      })

      it('Sent open Tx', function () {
        myGame.openChannel(
                    id,
                    player.address,
                    bankroller.address,
                    playerBalance,
                    bankrollerBalance,
                    openingBlock,
                    gameData,
                    _N,
                    _E,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)

        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())

      })

      it('REVERT> double opening', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })

    })

    describe('game round', function () {

      before('generate game data', function () {
        gameData = [42000]
        bet = 10
        seed = web3js.utils.randomHex(32)
        session++
      })

      it('sign data from player', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'uint',
          v: bet
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes32',
          v: seed
        })
        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSignGame = sign
      })

      it('sign data from bankroller', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'uint',
          v: bet
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes32',
          v: seed
        })
        let rsaSign = bankroller.RSA.signHash(dataHash).toString(16)
        assert.isOk(player.RSA.verify(dataHash, rsaSign))
        channel.RSASign = rsaSign
      })

      it('generate rnd', async function () {
        rnd = await myGame.generateRnd.call(channel.RSASign, 1, 65535)
      })

      it('game', async function () {
        let result = await myGame.game.call(gameData, bet, rnd)
        lastResult.win = Boolean(result[0])
        lastResult.value = result[1].toNumber()

      })

      it('offchain update channel', function () {
        if (lastResult.win) {
          playerBalance += lastResult.value
          bankrollerBalance -= lastResult.value
        } else {
          playerBalance -= lastResult.value
          bankrollerBalance += lastResult.value
        }
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: session
        })
        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: session
        })
        let sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

    })

    describe('update channel', function () {

      before('update info', function () {
        session++
        playerBalance = 2000
        bankrollerBalance = 19000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent update transaction', function () {
        myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        assert.equal(channel.session, session)
      })

    })

    describe('Dispute', function () {

      describe('game round', function () {

        before('generate game data', function () {
          gameData = [42000]
          bet = 10
          seed = web3js.utils.randomHex(32)
          session++
        })

        it('sign data from player', function () {
          let dataHash = web3js.utils.soliditySha3({
            t: 'bytes32',
            v: id
          }, {
            t: 'uint',
            v: session
          }, {
            t: 'uint',
            v: bet
          }, {
            t: 'uint',
            v: gameData
          }, {
            t: 'bytes32',
            v: seed
          }, )
          let sign = account.sign(dataHash, player.privateKey)
          let signer = web3js.eth.accounts.recover(dataHash, sign)
          assert.equal(player.address, signer, 'player is not a signer')
          channel.playerSignGame = sign
        })
      })

      describe('open dispute', function () {

        it('player openning dispute', function () {
          myGame.openDispute(id, session, bet, gameData, seed, channel.playerSignGame, {
            from: player.address
          })
        })

        it('check dispute', async function () {
          var result = await myGame.disputes.call(id)
          assert.equal(seed, result[0])
          assert.equal(bet, result[1].toNumber())
          assert.equal(player.address.toLowerCase(), result[2])
        })
      })

      describe('close dispute', function () {

        it('sign data from bankroller', function () {
          let dataHash = web3js.utils.soliditySha3({
            t: 'bytes32',
            v: id
          }, {
            t: 'uint',
            v: session
          }, {
            t: 'uint',
            v: bet
          }, {
            t: 'uint',
            v: gameData
          }, {
            t: 'bytes32',
            v: seed
          })
          let rsaSign = bankroller.RSA.signHash(dataHash).toString(16)
          assert.isOk(player.RSA.verify(dataHash, rsaSign))
          channel.RSASign = rsaSign
        })

        it('check RSA-sign in contract', async function () {
          let dataHash = web3js.utils.soliditySha3({
            t: 'bytes32',
            v: id
          }, {
            t: 'uint',
            v: session
          }, {
            t: 'uint',
            v: bet
          }, {
            t: 'uint[]',
            v: gameData
          }, {
            t: 'bytes32',
            v: seed
          })
          let result = await RSA.verify(dataHash, _N, _E, channel.RSASign)
          assert.isOk(result)
        })

        it('bankroller closing dispute', function () {
          myGame.resolveDispute(id, _N, _E, channel.RSASign, {
            from: bankroller.address
          })
        })
      })
    })
  })

    /**
    Scenario #5:
    - Bankroller opens the dispute
    - Player closes the dispute by update channel
    */
  describe('>>> scenario #5:', function () {
    var id, session, ttl_block, gameData, playerBalance, bankrollerBalance, totalBet, _E, _N
    var bet, seed, rnd
    var channel = {}
    var lastResult = {}

    before('init data', function () {
      totalBet = 100
      _E = '0x0' + player.RSA.RSA.e.toString(16)
      _N = '0x' + player.RSA.RSA.n.toString(16)
    })

    describe('Player open channel', function () {

      before('init opening data', async function () {
        session = 0
        id = web3js.utils.randomHex(32)
        openingBlock = await web3js.eth.getBlockNumber()
        gameData = [0]
        playerBalance = 1000
        bankrollerBalance = 20000
        console.log('>>>>!', openingBlock)
      })

      it('Player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let data = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'address',
          v: player.address
        }, {
          t: 'address',
          v: bankroller.address
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: openingBlock
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes',
          v: _N
        }, {
            t: 'bytes',
            v: _E
          })

        let sign = account.sign(data, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(data, sign)

        assert.equal(bankroller.address, signer, 'bankroller is not a signer')
        channel.bankrollerSign = sign
      })

      it('REVERT> Hacker open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: hacker.address
                        }
                    )
                )
      })

      it('REVERT> Invalid sign open Tx', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.playerSign, {
                          from: player.address
                        }
                    )
                )
      })

      it('Sent open Tx', function () {
        myGame.openChannel(
                    id,
                    player.address,
                    bankroller.address,
                    playerBalance,
                    bankrollerBalance,
                    openingBlock,
                    gameData,
                    _N,
                    _E,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)

        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())

      })

      it('REVERT> double opening', async function () {
        await expectThrow(
                    myGame.openChannel(
                        id,
                        player.address,
                        bankroller.address,
                        playerBalance,
                        bankrollerBalance,
                        openingBlock,
                        gameData,
                        _N,
                        _E,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
                )
      })

    })

    describe('game round', function () {

      before('generate game data', function () {
        gameData = [42000]
        bet = 10
        seed = web3js.utils.randomHex(32)
        session++
      })

      it('sign data from player', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'uint',
          v: bet
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes32',
          v: seed
        })
        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'player is not a signer')
        channel.playerSignGame = sign
      })

      it('sign data from bankroller', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: session
        }, {
          t: 'uint',
          v: bet
        }, {
          t: 'uint',
          v: gameData
        }, {
          t: 'bytes32',
          v: seed
        })
        let rsaSign = bankroller.RSA.signHash(dataHash).toString(16)
        assert.isOk(player.RSA.verify(dataHash, rsaSign))
        channel.RSASign = rsaSign
      })

      it('generate rnd', async function () {
        rnd = await myGame.generateRnd.call(channel.RSASign, 1, 65535)
      })

      it('game', async function () {
        let result = await myGame.game.call(gameData, bet, rnd)
        lastResult.win = Boolean(result[0])
        lastResult.value = result[1].toNumber()

      })

      it('offchain update channel', function () {
        if (lastResult.win) {
          playerBalance += lastResult.value
          bankrollerBalance -= lastResult.value
        } else {
          playerBalance -= lastResult.value
          bankrollerBalance += lastResult.value
        }
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: session
        })
        let sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)
        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

    })

    describe('update channel', function () {

      before('update info', function () {
        session++
        playerBalance = 2000
        bankrollerBalance = 19000
        totalBet = 1000
      })

      it('player sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        let sign = account.sign(dataHash, player.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(player.address, signer, 'invalid sign')
        channel.playerSign = sign
      })

      it('bankroller sign data', function () {
        let dataHash = web3js.utils.soliditySha3({
          t: 'bytes32',
          v: id
        }, {
          t: 'uint',
          v: playerBalance
        }, {
          t: 'uint',
          v: bankrollerBalance
        }, {
          t: 'uint',
          v: totalBet
        }, {
          t: 'uint',
          v: session
        })

        sign = account.sign(dataHash, bankroller.privateKey)
        let signer = web3js.eth.accounts.recover(dataHash, sign)

        assert.equal(bankroller.address, signer, 'invalid sign')
        channel.bankrollerSign = sign
      })

      it('sent update transaction', function () {
        myGame.updateChannel(
                    id,
                    playerBalance,
                    bankrollerBalance,
                    totalBet,
                    session,
                    channel.bankrollerSign, {
                      from: player.address
                    }
                )
      })

      it('check channel', async function () {
        let result = await myGame.channels.call(id)
        let channel = arrToChannel(result)
        assert.equal(channel.state, 'open', 'invalid state')
        assert.equal(channel.player, player.address.toLowerCase())
        assert.equal(channel.bankroller, bankroller.address.toLowerCase())
        assert.equal(channel.session, session)
      })

    })

    describe('Dispute', function () {

      describe('game round', function () {

        before('generate game data', function () {
          gameData = [42000]
          bet = 10
          seed = web3js.utils.randomHex(32)
          session++
        })

        it('sign data from player', function () {
          let dataHash = web3js.utils.soliditySha3({
            t: 'bytes32',
            v: id
          }, {
            t: 'uint',
            v: session
          }, {
            t: 'uint',
            v: bet
          }, {
            t: 'uint',
            v: gameData
          }, {
            t: 'bytes32',
            v: seed
          })
          let sign = account.sign(dataHash, player.privateKey)
          let signer = web3js.eth.accounts.recover(dataHash, sign)
          assert.equal(player.address, signer, 'player is not a signer')
          channel.playerSignGame = sign
        })

        it('sign data from bankroller', function () {
          let dataHash = web3js.utils.soliditySha3({
            t: 'bytes32',
            v: id
          }, {
            t: 'uint',
            v: session
          }, {
            t: 'uint',
            v: bet
          }, {
            t: 'uint',
            v: gameData
          }, {
            t: 'bytes32',
            v: seed
          })
          let rsaSign = bankroller.RSA.signHash(dataHash).toString(16)
          assert.isOk(player.RSA.verify(dataHash, rsaSign))
          channel.RSASign = rsaSign
        })

        it('generate rnd', async function () {
          rnd = await myGame.generateRnd.call(channel.RSASign, 1, 65535)
        })

        it('game', async function () {
          let result = await myGame.game.call(gameData, bet, rnd)
          lastResult.win = Boolean(result[0])
          lastResult.value = result[1].toNumber()

        })

        it('offchain update channel', function () {
          if (lastResult.win) {
            playerBalance += lastResult.value
            bankrollerBalance -= lastResult.value
          } else {
            playerBalance -= lastResult.value
            bankrollerBalance += lastResult.value
          }
        })

        it('bankroller sign data', function () {
          let dataHash = web3js.utils.soliditySha3({
            t: 'bytes32',
            v: id
          }, {
            t: 'uint',
            v: playerBalance
          }, {
            t: 'uint',
            v: bankrollerBalance
          }, {
            t: 'uint',
            v: totalBet
          }, {
            t: 'uint',
            v: session
          })
          let sign = account.sign(dataHash, bankroller.privateKey)
          let signer = web3js.eth.accounts.recover(dataHash, sign)
          assert.equal(bankroller.address, signer, 'invalid sign')
          channel.bankrollerSign = sign
        })

      })

      describe('open dispute', function () {

        it('bankroller openning dispute', function () {
          myGame.openDispute(id, session, bet, gameData, seed, channel.playerSignGame, {
            from: bankroller.address
          })
        })

        it('check dispute', async function () {
          var result = await myGame.disputes.call(id)
          assert.equal(seed, result[0])
          assert.equal(bet, result[1].toNumber())
          assert.equal(bankroller.address.toLowerCase(), result[2])
        })
      })

      describe('close dispute', function () {

        it('sent update transaction', function () {
          myGame.updateChannel(
                        id,
                        playerBalance,
                        bankrollerBalance,
                        totalBet,
                        session,
                        channel.bankrollerSign, {
                          from: player.address
                        }
                    )
        })

        it('check channel', async function () {
          let result = await myGame.channels.call(id)
          let channel = arrToChannel(result)

          assert.equal(channel.state, 'open', 'invalid state')
          assert.equal(channel.player, player.address.toLowerCase())
          assert.equal(channel.bankroller, bankroller.address.toLowerCase())
          assert.equal(channel.session, session)
        })
      })
    })
  })

})
