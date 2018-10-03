/* global DAppsLogic */


export default new class myDapp {
  constructor () {
    this.DApp = false
  }

  // Create Dapp instance
  async init (dappConfig) {
    if (this.DApp && this.DApp.web3) {
      console.warn('Dapp allready created')
      return
    }

    await this.checkLogicExistAndLoaded()

    // Create new Dapp
    this.DApp = new DCLib.DApp(dappConfig)

    console.groupCollapsed('Dapp created')
    console.log(this.DApp)
    console.groupEnd()

    return this.DApp
  }

  // Find & Connect to bankroller
  // send openchannel TX
  startGame (deposit, callback = false) {
    console.log('Connect with deposit', deposit)

    return new Promise((resolve, reject) => {
      try {
        this.DApp.connect({
          bankroller : 'auto',
          paychannel : { deposit : deposit },
          gamedata   : {type:'uint', value:[1, 2, 3]}
        }, function (connected, info) {
          const result = Object.assign(info, {connected:connected})

          if (callback) callback( result )
          if (connected) {
            resolve(result)
          } else {
            reject(result)
          }
        })
      } catch (err) {
        reject(err)
      }
    })

  }

  // Call basic game function
  // generate random signidice algorithm
  // on bankroller side with your "seed"
  // see: docker logs - f dc_bankroller
  play (userBet, userChoice) {
    // return a Promise
    return this.DApp.Game(
      userBet, userChoice, 
      // data for generate random hash on bankroller side
      DCLib.randomHash({bet:userBet, gamedata:[userChoice]})
    )
  }

  // Send msg to bankroller that you want to end game 
  // and sen close channel TX
  endGame (callback = false) {
    return new Promise(resolve => {
      this.DApp.disconnect( result => {
        if (callback) callback(result)
        resolve(result)
      })
    })
  }


  // Utility function, to check thet file with dapp logic exist and loaded
  checkLogicExistAndLoaded (callback = false) {
    return new Promise((resolve, reject) => {
      let i
      let c = setInterval(() => {
        i++
        if (DAppsLogic[process.env.DAPP_SLUG]) {
          clearInterval(c)

          this.logicExist = true
          resolve(this.logicExist)
          if (callback) callback(this.logicExist)
        } else if (i > 100) {
          clearInterval(c)
          this.logicExist = true
          reject(this.logicExist)
          if (callback) callback(this.logicExist)
        }
      }, 100)
    })
  }
}()
