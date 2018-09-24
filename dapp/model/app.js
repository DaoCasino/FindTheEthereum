/* global DAppsLogic */

export default new class myDapp {
    constructor(){
        console.log("!!! app.js");
        this.Dapp = false;
    }

    async init(dapp_config) {
        if (this.DApp && this.DApp.web3) {
            console.warn('Dapp allready created')
            return
        }

        await this.checkLogicExistAndLoaded()

        // Create new Dapp
        // link to doc: @TODO
        this.DApp = new DCLib.DApp(dapp_config)


        // for debug in browser console
        if (typeof window !== 'undefined') window.myDApp = this.DApp

        console.groupCollapsed('Dapp created')
        console.log(this.DApp)
        console.groupEnd()
    }

    startGame() {

    }

    play() {

    }

    endGame() {

    }

    checkLogicExistAndLoaded(callback = false) {
        return new Promise((resolve, reject) => {
            let i
            let c = setInterval(() => {
                i++
                if (DAppsLogic[process.env.DAPP_SLUG]) {
                    clearInterval(c)
                    this.logic_exist = true
                    resolve(this.logic_exist)
                    if (callback) callback(this.logic_exist)
                } else if (i > 100) {
                    clearInterval(c)
                    this.logic_exist = true
                    reject(this.logic_exist)
                    if (callback) callback(this.logic_exist)
                }
            }, 100)
        })
    }
}()