import API from "./API.js"
import Callback from "./Callback.js"
import dapp from "../dapp.logic.js"
import manifest from "../dapp.manifest.js"
import InterfaceObject from "./InterfaceObject.js"
import ItemBox from "./ItemBox.js"
import ItemLoading from "./ItemLoading.js"
import ItemResult from "./ItemResult.js"
import ItemTooltip from "./ItemTooltip.js"
import ItemTutorial from "./ItemTutorial.js"
import WndDeposit from "./WndDeposit.js"
import WndInfo from "./WndInfo.js"
import WndInstruction from "./WndInstruction.js"
import WndWin from "./WndWin.js"

export default class Game extends InterfaceObject {
    constructor() {
        super();
        
        this.initData();

        this.cb = new Callback()

        let bg = API.addObj("bgGame", API._W / 2, API._H / 2);
        let scaleBack = API._W / bg.w;
        bg.scale.x = scaleBack;
        bg.scale.y = scaleBack;
        this.addChild(bg);

        let tableLogo = API.addObj("tableLogoGameNew");
        tableLogo.scale.x = scaleBack;
        tableLogo.scale.y = scaleBack;
        tableLogo.x = 952 * scaleBack;
        tableLogo.y = 546 * scaleBack;
        this.addChild(tableLogo);
        
        this.createLayers();
        this.createBooleans();
        this.createNumbers();
        this.createArrays();
        this.createStrings();
        
        this.createGui();
        this.createBtn();
        this.refreshData();
    }

    // CREATE
    createLayers() {
        this.back_mc = new PIXI.Container();
        this.game_mc = new PIXI.Container();
        this.face_mc = new PIXI.Container();
        this.warning_mc = new PIXI.Container();
        this.wnd_mc = new PIXI.Container();
        this.tutor_mc = new PIXI.Container();
        this.tooltip_mc = new PIXI.Container();

        this.addChild(this.game_mc);
        this.addChild(this.back_mc);
        this.addChild(this.face_mc);
        this.addChild(this.warning_mc);
        this.addChild(this.wnd_mc);
        this.addChild(this.tutor_mc);
        this.addChild(this.tooltip_mc);
    }

    createBooleans() {
        this._gameOver = true;
        this._bWindow = false;
        this._bCloseChannel = false;
    }

    createNumbers() {
        this._idTutor = 0;
        this._idBox = 0;
        this._betGame = 1;
        this._balanceBet = 0;
        this._balanceEth = 0;
        this._balanceSession = 0;
        this._timeCloseWnd = 0;
        this._depositBankroll = 0;
        this._profit = 0;
    }

    createArrays() {
        this._arBoxes = [];
    }

    createStrings() {
        if(API.options_debug){
            this._openkey = "0x000000000000000000000000000000000000000"
            this.DC_NETWORK = "local"
        } else {
            this._openkey = window.webapi.account.address
            this.DC_NETWORK = window.webapi.account._params.config.blockchainNetwork
        }

        this.urlEtherscan = "https://" + this.DC_NETWORK + ".etherscan.io/"
    }

    createGui() {
        let sizeTf = 40;
        let posY = 48;
        let offsetY = 84;

        this._bgDark = new PIXI.Graphics();
        this._bgDark.beginFill(0x000000).drawRect(0, 0, API._W, API._H).endFill();
        this._bgDark.alpha = 0.5;
        this._bgDark.visible = false;
        this.back_mc.addChild(this._bgDark);

        let icoKey = API.addObj("icoKey", 52, posY);
        this.face_mc.addChild(icoKey);
        let icoBet = API.addObj("icoBet", 52, posY + offsetY * 1);
        this.face_mc.addChild(icoBet);
        this._tfAddress = API.addText(this._openkey, sizeTf, "#ffffff", "#000000", "left", 600, 4);
        this._tfAddress.x = icoKey.x + icoKey.w / 2 + 10;
        this._tfAddress.y = icoKey.y - this._tfAddress.height / 2;
        this.face_mc.addChild(this._tfAddress);
        this._tfBalance = API.addText("0  BET", sizeTf, "#ffffff", "#000000", "left", 400, 4);
        this._tfBalance.x = this._tfAddress.x;
        this._tfBalance.y = icoBet.y - this._tfBalance.height / 2;
        this.face_mc.addChild(this._tfBalance);
        this._tfOpenTime = API.addText("", sizeTf, "#ffffff", "#000000", "center", 400, 4);
        this._tfOpenTime.x = API._W / 2;
        this._tfOpenTime.y = API._H - 100 - this._tfOpenTime.height / 2;
        this.face_mc.addChild(this._tfOpenTime);
        this._tfBlockchain = API.addText("", sizeTf, "#FFCC00", "#000000", "center", 700, 4);
        this._tfBlockchain.x = API._W / 2;
        this._tfBlockchain.y = API._H - 150 - this._tfBlockchain.height / 2;
        this.face_mc.addChild(this._tfBlockchain);
        this._tfWarning = API.addText("", sizeTf, "#EC8200", "#000000", "center", 700, 4);
        this._tfWarning.x = API._W / 2;
        this._tfWarning.y = API._H - 250 - this._tfWarning.height / 2;
        this.face_mc.addChild(this._tfWarning);
        let tfVersion = API.addText(API.version, 24, "#ffffff", "#000000", "right", 400, 4);
        tfVersion.x = API._W - 30;
        tfVersion.y = API._H - tfVersion.height - 10;
        this.face_mc.addChild(tfVersion);

        this._itemBet = new PIXI.Container();
        this._itemBet.x = API._W / 2;
        this._itemBet.y = 878;
        this.back_mc.addChild(this._itemBet);
        let bgBet = API.addObj("bgBet");
        this._itemBet.addChild(bgBet);
        let itemBet = API.addObj("itemBet", -120);
        this._itemBet.addChild(itemBet);
        this._tfBet = API.addText("", 60, "#ED9829", "#000000", "left", 400);
        this._tfBet.x = -50;
        this._tfBet.y = -this._tfBet.height / 2 - 5;
        this._itemBet.addChild(this._tfBet);
        this._itemBet.visible = false;
    }

    createBtn(){
        let doc = window.document;
        let docEl = doc.documentElement;
        this._fRequestFullScreen = docEl.requestFullscreen ||
            docEl.mozRequestFullScreen ||
            docEl.webkitRequestFullScreen ||
            docEl.msRequestFullscreen;
        this._fCancelFullScreen = doc.exitFullscreen ||
            doc.mozCancelFullScreen ||
            doc.webkitExitFullscreen ||
            doc.msExitFullscreen;

        this._btnStart = API.addButton("btnText", API._W / 2, 878);
        this._btnStart.overSc = true;
        this._btnStart.name = "btnStart";
        this._btnStart.visible = false;
        this.face_mc.addChild(this._btnStart);
        this.arButtons.push(this._btnStart);
        let tfStart = API.addText(API.getText("new_game"), 34, "#FFFFFF", undefined, "center", 240);
        tfStart.x = 0;
        tfStart.y = -tfStart.height / 2;
        this._btnStart.addChild(tfStart);

        // frame player address
        let wAdr = this._tfAddress.width + 10;
        let hAdr = 50;
        let btnFrame = new PIXI.Container();
        let objImg = new PIXI.Graphics();
        objImg.beginFill(0xFFCC00).drawRect(-wAdr / 2, -hAdr / 2, wAdr, hAdr).endFill();
        objImg.alpha = 0;
        btnFrame.addChild(objImg);
        btnFrame.over = new PIXI.Graphics();
        btnFrame.over.lineStyle(3, 0xFFCC00, 1);
        btnFrame.over.drawRect(-wAdr / 2, -hAdr / 2, wAdr, hAdr);
        btnFrame.over.visible = false;
        btnFrame.addChild(btnFrame.over);
        btnFrame.name = "btnAddress";
        btnFrame.w = objImg.width;
        btnFrame.h = objImg.height;
        btnFrame.x = this._tfAddress.x + btnFrame.w / 2 - 2;
        btnFrame.y = this._tfAddress.y + btnFrame.h / 2 - 7;
        btnFrame.interactive = true;
        btnFrame.buttonMode = true;
        btnFrame._selected = false;
        btnFrame._disabled = false;
        this.face_mc.addChild(btnFrame);
        this.arButtons.push(btnFrame);
        
        let posX = 1840;
        let posY = 960;
        let offsetY = 135;
        this._btnContract = API.addButton("btnContract", posX, posY - 0 * offsetY);
        this._btnContract.tooltip = "show_contract";
        this._btnContract.overSc = true;
        this.face_mc.addChild(this._btnContract);
        this.arButtons.push(this._btnContract);
        let btnInstruct = API.addButton("btnInstruct", posX, posY - 1 * offsetY);
        btnInstruct.tooltip = "instruction";
        btnInstruct.overSc = true;
        this.face_mc.addChild(btnInstruct);
        this.arButtons.push(btnInstruct);
        let btnHistory = API.addButton("btnHistory", posX, posY - 2 * offsetY);
        btnHistory.tooltip = "show_history";
        btnHistory.overSc = true;
        this.face_mc.addChild(btnHistory);
        this.arButtons.push(btnHistory);
        this._btnCashout = API.addButton("btnCashout", posX, posY - 3 * offsetY);
        this._btnCashout.tooltip = "cashout";
        this._btnCashout.overSc = true;
        this.face_mc.addChild(this._btnCashout);
        this.arButtons.push(this._btnCashout);
        let btnFacebook = API.addButton("btnFacebook", 1870, 48);
        btnFacebook.overSc = true;
        this.face_mc.addChild(btnFacebook);
        this.arButtons.push(btnFacebook);
        let btnTwitter = API.addButton("btnTwitter", 1870, 123);
        btnTwitter.overSc = true;
        this.face_mc.addChild(btnTwitter);
        this.arButtons.push(btnTwitter);
        
        this._btnCashout.setAplhaDisabled(true);
        this._btnContract.setAplhaDisabled(true);
        btnHistory.setAplhaDisabled(true);
        
        // Tooltip
        this._tooltip = new ItemTooltip();
        this._tooltip.x = API._W / 2;
        this._tooltip.y = API._H / 2;
        this._tooltip.visible = false;
        this.tooltip_mc.addChild(this._tooltip);
    }

    createTreasure() {
        let w = 1300;
        let offset = w / 3;
        let arPosY = [400, 250, 400];
        let arName = ["L", "", "R"];

        for (let i = 0; i < 3; i++) {
            let box = new ItemBox(this, arName[i]);
            box.x = API._W / 2 - w / 2 + offset * i + offset / 2;
            box.y = arPosY[i];
            box.id = (i + 1);
            this.game_mc.addChild(box);
            this.arButtons.push(box);
            this._arBoxes.push(box);
        }
    }

    createWndInfo(str, callback, addStr) {
        if (this._wndInfo == undefined) {
            this._wndInfo = new WndInfo(this)
            this._wndInfo.x = API._W / 2
            this._wndInfo.y = API._H / 2
            this.wnd_mc.addChild(this._wndInfo)
        }

        this._bWindow = true
        if (this._tooltip) {
            this._tooltip.visible = false
        }

        this._wndInfo.show(str, callback, addStr)
        this._wndInfo.visible = true
        this._curWindow = this._wndInfo
    }

    // REFRESH
    refreshData() {
        const _self = this
        this.showWndWarning(API.getText("loading"))

        this.getBalances(function () {
            _self._wndWarning.visible = false
            if (_self._balanceEth == 0 || _self._balanceBet == 0) {
                _self.showError("error_balance", function () {
                    //TODO
                })
                return
            }

            if (_self._balanceEth < 0.1) {
                _self.showError("error_balance_eth", function () {
                    //TODO
                })
            } else {
                _self.showWndDeposit()
                _self.showTutorial(1)
            }
        })
    }

    getBalances(callback) {
        const _self = this
        if(API.options_debug){
            _self._balanceEth = 1
            _self._balanceBet = 10

            _self.refreshBalance()

            callback()
        } else {
            if (this._openkey){
                webapi._Eth.getBalances().then(function (res) {
                    _self._balanceEth = Number(res.eth.balance)
                    _self._balanceBet = Number(res.bet.balance)

                    _self.refreshBalance()

                    callback()
                })
            } else {
                this.showError("error_account", _self.showMenu)
            }
        }
    }

    refreshBalance(){
        this._balanceBet = Math.floor(this._balanceBet)
        this._balanceSession = Math.floor(this._balanceSession)
        let str = this._balanceSession + "/(" + this._balanceBet + ") BET"
        this._tfBalance.setText(str)
    }

    refreshButtons() {
        for (let i = 0; i < this.arButtons.length; i++) {
            let item_mc = this.arButtons[i]
            item_mc._selected = false
        }
    }

    //SHOW
    showWndDeposit(){
        if (this._bWindow) {
            return
        }

        if (this._wndDeposit == undefined) {
            this._wndDeposit = new WndDeposit(this)
            this._wndDeposit.x = API._W / 2
            this._wndDeposit.y = API._H / 2
            this.wnd_mc.addChild(this._wndDeposit)
        }
        
        if (this._tooltip) {
            this._tooltip.visible = false
        }

        const _self = this
        this._bWindow = true
        let str = API.getText("set_deposit").replace(new RegExp("SPL"), "\n")
        this._wndDeposit.show(
            str,
            function (value) {
                _self.createGame(value)
            },
            _self._balanceBet
        )
        this._timeCloseWnd = 0
        this._wndDeposit.visible = true
        this._curWindow = this._wndDeposit
    }

    showWndBet() {
        if (this._bWindow) {
            return
        }
        if (this._wndBet == undefined) {
            let style = {
                bg: "bgWndBet",
                colorDesc: "#FFCC00"
            }
            this._wndBet = new WndDeposit(this, style)
            this._wndBet.x = API._W / 2
            this._wndBet.y = API._H / 2
            this.wnd_mc.addChild(this._wndBet)
        }

        if (this._idTutor == 1) {
            this.showTutorial(2)
        }
        if (this._tooltip) {
            this._tooltip.visible = false
        }

        const _self = this
        this._bWindow = true
        let str = API.getText("set_bet").replace(new RegExp("SPL"), "\n")
        this._wndBet.show(
            str,
            function (value) {
                _self.setBet(value)
            },
            this._balanceSession
        )
        this._timeCloseWnd = 0
        this._wndBet.visible = true
        this._curWindow = this._wndBet
    }

    showWndWin() {
        if (this._bWindow) {
            return
        }
        if (this._wndWin == undefined) {
            this._wndWin = new WndWin(this)
            this._wndWin.x = API._W / 2
            this._wndWin.y = API._H / 2
            this.wnd_mc.addChild(this._wndWin)
        }
        let str = API.getText("win") + "!"
        str = "+" + this._profit
        if (this._tooltip) {
            this._tooltip.visible = false
        }

        this._itemTutorial.visible = false
        this._bWindow = true
        this._wndWin.show(str, this.closeGame)
        this._timeCloseWnd = 0
        this._wndWin.visible = true
        this._curWindow = this._wndWin
    }

    showTutorial(id) {
        if (this._itemTutorial == undefined) {
            this._objTutor = {}
            this._itemTutorial = new ItemTutorial(this)
            this._itemTutorial.x = API._W / 2
            this._itemTutorial.y = API._H / 2
            this.tutor_mc.addChild(this._itemTutorial)
        }

        this._idTutor = id
        if (this._objTutor[id] && id != 5) {
            return
        }
        this._objTutor[id] = true

        switch (id) {
            default:
                this._itemTutorial.x = 1450
                this._itemTutorial.y = 850
                break
        }

        this._itemTutorial.show(API.getText("tutor_" + id))
        this._itemTutorial.visible = true
    }

    showInstruction() {
        let _wndInstruction = this._wndInstruction
        if (_wndInstruction == undefined) {
            _wndInstruction = new WndInstruction(this)
            _wndInstruction.x = API._W / 2
            _wndInstruction.y = API._H / 2
            this.addChild(_wndInstruction)
        }

        this._bWindow = true
        _wndInstruction.visible = true
        this._curWindow = _wndInstruction
        this._wndInstruction = _wndInstruction
    }

    showMenu(_self) {
        API.addScreen("ScrMenu");
    }

    showWndWarning(str) {
        let _wndWarning = this._wndWarning;

        if (_wndWarning == undefined) {
            _wndWarning = new PIXI.Container()
            _wndWarning.x = API._W / 2
            _wndWarning.y = API._H / 2
            this.warning_mc.addChild(_wndWarning)

            let bg = API.addObj("bgWndWarning")
            _wndWarning.addChild(bg)
            let tfTitle = API.addText(
                API.getText("please_wait"),
                40,
                "#FFCC00",
                "#000000",
                "center",
                470,
                3
            )
            tfTitle.y = -100
            _wndWarning.addChild(tfTitle)
            let tf = API.addText("", 26, "#FFFFFF", "#000000", "center", 470, 3)
            tf.y = -30
            _wndWarning.addChild(tf)

            let loading = new ItemLoading()
            loading.x = 0
            loading.y = 80
            _wndWarning.addChild(loading)

            _wndWarning.tf = tf
            _wndWarning.loading = loading
        }

        _wndWarning.tf.setText(str)
        _wndWarning.tf.y = -_wndWarning.tf.height / 2
        _wndWarning.visible = true

        this._wndWarning = _wndWarning
    }

    showError(value, callback) {
        let str = "ERROR! \n\n " + API.getText(value);

        if (this._wndWarning) {
            this._wndWarning.visible = false
        }
        this.refreshButtons()

        this.createWndInfo(str, function () {
            if (callback) {
                if (typeof callback == "function") {
                    callback()
                }
            }
        })
    }

    // CHANNEL
    createGame(deposit) {
        deposit = Number(deposit)
        
        if (this._idTutor == 1) {
            this._itemTutorial.visible = false
        }

        this._bWindow = false

        this._depositPlayer = deposit
        let params = {
            name: manifest.slug,
            gameContractAddress: manifest.getContract(this.DC_NETWORK).address,
            gameLogicFunction: dapp,
            rules: manifest.rules
        }
        
        if(API.options_debug == false){
            window.game = window.webapi.createGame(params)
        }

        this.showWndWarning(API.getText("search_bankroller"))
        this.connectToBankroll(deposit)
    }

    async connectToBankroll(deposit){
        if(API.options_debug){
            this.connected(deposit)
            return
        }
        try {
            await window.game.start()
            const resultConnect = await window.game.connect({playerDeposit: deposit})
            if (resultConnect.channelBalances) {
                this._depositBankroll = resultConnect.channelBalances.bankroller
            }
            this._addressBankroll = resultConnect.dealerAddress
            this.addressContract = manifest.getContract(this.DC_NETWORK).address

            this.connected(deposit)
        } catch (error) {
            let str = error.message || error
            this.showError(str)
            console.error(error)
        }
    }

    connected(deposit) {
        const _self = this
        this._tfOpenTime.setText("")
        this._tfBlockchain.setText("")
        this._tfWarning.setText("")

        this._wndWarning.visible = false
        this._balanceSession = deposit
        this._depositPlayer = deposit

        this.getBalances(function () {
            _self.refreshButtons()
            if (_self._tooltip) {
                _self._tooltip.visible = false
            }
            if (_self.addressContract) {
                _self._btnContract.setAplhaDisabled(false)
            }
            _self.closeWindow()
            _self.createTreasure()
            _self.showWndBet()
        })
    }

    disconnect() {
        if (this._bCloseChannel || API.options_debug || !this._gameOver) {
            return false
        }

        const _self = this
        this._bCloseChannel = true
        this._itemTutorial.visible = false
        this._btnCashout.setAplhaDisabled(true)

        this.showWndWarning(API.getText("disconnecting"))
        this._btnStart.visible = false

        window.game.disconnect().then(function (res) {
            _self._wndWarning.visible = false
            _self._balanceSession = 0
            _self._tfOpenTime.setText("")
            _self._tfBlockchain.setText("")
            _self.refreshButtons()
            //console.log("Game disconnect:", res)
            if (res.resultBalances) {
                _self.createWndInfo(API.getText("close_channel"), _self.showMenu)
            } else {
                _self.showError("disconnected", function () {
                    // TODO
                })
            }
        })
    }

    // ACTION
    setBet(value) {
        this._betGame = Number(value)
        this._balanceSession = Number(this._balanceSession) - this._betGame
        this.refreshBalance()
        this._itemBet.visible = true
        this._bgDark.visible = false
        this._gameOver = false

        if (this._idTutor == 2) {
            this.showTutorial(3)
        }

        this._tfBet.setText(this._betGame)
    }

    refreshBoxes() {
        for (let i = 0; i < this._arBoxes.length; i++) {
            let box = this._arBoxes[i]
            box.refresh()
        }
    }

    newGame() {
        if (this._balanceSession < 1) {
            this.showError("error_balance_bet", function () {
                //TODO
            })
        } else {
            if (this._idTutor == 4) {
                this._itemTutorial.visible = false
            }
            this.refreshBoxes()
            this._gameOver = false
            this._btnStart.visible = false
            this._btnCashout.setAplhaDisabled(true)
            this.showWndBet()
        }
    }

    closeGame(_self){
        _self._gameOver = true
        _self._bgDark.visible = false
        _self._itemBet.visible = false
        _self._bCloseChannel = false
        if (API.options_debug) {
            _self._btnStart.visible = true
        } else {
            _self._btnCashout.setAplhaDisabled(false)
            if (_self._balanceSession == 0) {
                _self.disconnect()
            } else {
                _self._btnStart.visible = true
            }
        }
    }

    // CLOSE
    closeWindow(wnd) {
        if (wnd) {
            this._curWindow = wnd;
        }
        if (this._curWindow) {
            this._curWindow.visible = false;
            this._curWindow = undefined;
            this._bWindow = false
        }
    }

    // CLICK
    clickBox(box) {
        let _self = this;
        this._gameOver = true
        this._idBox = box.id
        box.setSelected(true)

        if (this._idTutor == 3) {
            this._itemTutorial.visible = false
        }

        let params = {
            userBets: [this._betGame],
            gameData: {
                randomRanges: [[1, 3]],
                custom: { playerNumbers: { t: 'uint256', v: [this._idBox] } }
            }
        }
        
        if(API.options_debug){
            let rnd = Math.ceil(Math.random()*3)
            let pr = -this._betGame
            let win = (rnd == this._idBox)
            if (win){
                pr = this._betGame * 2
            }
            let result = {
                profit: (this._balanceSession + pr), 
                balances: { 
                    bankroller: 28,
                    player: (this._balanceSession + pr)
                }, 
                data: [{ user: this._idBox, random: rnd, win: win }], 
                randomNums: [rnd]
            }
            this.showResult(result, box)
        } else {
            window.game
                .play(params)
                .then(function (result) {
                    _self.showResult(result, box)
                })
        }
        
    }

    clickFB(){
        let url = "https://www.facebook.com/DAO.Casino/";
        window.open(url, "_blank")
    }

    clickTwitter() {
        let url = "https://twitter.com/daocasino";
        window.open(url, "_blank")
    }

    clickContract() {
        var url = this.urlEtherscan + "address/" + this.addressContract;
        window.open(url, "_blank");
    }

    clickCashout() {
        this.disconnect()
    }

    clickObj(item_mc) {
        if (item_mc._disabled) {
            return
        }

        if (this._tooltip) {
            this._tooltip.visible = false
        }

        item_mc._selected = false
        if (item_mc.over && item_mc.name != "ItemBox") {
            item_mc.over.visible = false
        }
        if (item_mc.overSc) {
            item_mc.scale.x = 1 * item_mc.sc
            item_mc.scale.y = 1 * item_mc.sc
        }

        if (item_mc.name == "ItemBox") {
            this.clickBox(item_mc)
        } else if (item_mc.name == "btnStart") {
            this.newGame()
        } else if (item_mc.name == "btnHistory") {
            //this.showWndHistory()
        } else if (item_mc.name == "btnContract") {
            this.clickContract()
        } else if (item_mc.name == "btnCashout") {
            this.clickCashout()
        } else if (item_mc.name == "btnInstruct") {
            this.showInstruction()
        } else if (item_mc.name == "btnAddress") {
            let url = this.urlEtherscan + "address/" + this._openkey
            window.open(url, "_blank")
        } else if (item_mc.name == "btnDao") {
            let url = "https://platform.dao.casino/";
            window.open(url, "_blank")
        } else if (item_mc.name == "btnFacebook") {
            this.clickFB()
        } else if (item_mc.name == "btnTwitter") {
            this.clickTwitter()
        }
    }

    checkButtons(evt) {
        if (this._bWindow) {
            return
        }
        let mouseX = evt.data.global.x
        let mouseY = evt.data.global.y

        if (this._tooltip) {
            this._tooltip.visible = false
        }

        for (let i = 0; i < this.arButtons.length; i++) {
            let item_mc = this.arButtons[i]
            if (API.hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)) {
                if (
                    item_mc._selected == false &&
                    !item_mc._disabled &&
                    item_mc.visible
                ) {
                    item_mc._selected = true
                    if (item_mc.over) {
                        if (item_mc.name == "ItemBox") {
                            if (this._gameOver) {
                                item_mc._selected = false
                                break
                            }
                            item_mc.main.visible = false
                        }
                        item_mc.over.visible = true
                    } else if (item_mc.overSc) {
                        item_mc.scale.x = 1.1 * item_mc.sc
                        item_mc.scale.y = 1.1 * item_mc.sc
                    }
                }

                if (item_mc.visible) {
                    if (this._tooltip && item_mc.tooltip) {
                        this._tooltip.show(API.getText(item_mc.tooltip))
                        this._tooltip.x = item_mc.x - (item_mc.w / 2 + this._tooltip.w / 2)
                        this._tooltip.y = item_mc.y
                        this._tooltip.visible = true
                        if (this._tooltip.x + this._tooltip.w / 2 > API._W) {
                            this._tooltip.x = API._W - this._tooltip.w / 2
                        }
                        if (this._tooltip.y - this._tooltip.h / 2 < 0) {
                            this._tooltip.y = this._tooltip.h / 2
                        }
                    }
                }
            } else {
                if (item_mc._selected) {
                    item_mc._selected = false
                    if (item_mc.over) {
                        item_mc.over.visible = false
                        if (item_mc.name == "ItemBox") {
                            item_mc.main.visible = true
                        }
                    } else if (item_mc.overSc) {
                        item_mc.scale.x = 1 * item_mc.sc
                        item_mc.scale.y = 1 * item_mc.sc
                    }
                }
            }
        }
    }

    // UPDATE
    update(diffTime) {
        if (this.cb){
            this.cb.update(diffTime)
        }
        if (this._wndWarning) {
            if (this._wndWarning.visible) {
                this._wndWarning.loading.update(diffTime)
            }
        }

        if (!API.options_pause) {
            for (var i = 0; i < API.arClips.length; i++) {
                var clip = API.arClips[i]
                if (clip) {
                    clip.enter_frame()
                }
            }
        }
    }

    // RESULT
    showResult(result, box) {
        const _self = this
        this._balanceSession = result.balances.player
        this.refreshBalance()
        this._profit = result.profit

        for (let i = 0; i < this._arBoxes.length; i++) {
            let item_mc = this._arBoxes[i]
            item_mc.setDisabled(true)
        }

        let randomNum = result.randomNums[0]
        let win = box.id === randomNum

        if (win) {
            box.openBox(true)
        } else {
            box.openBox(false)
        }
        
        let it = new ItemResult(win, box.x, box.y - 200)
        this.face_mc.addChild(it)

        this.cb.call(1000, function () {
            for (let i = 0; i < _self._arBoxes.length; i++) {
                let item_mc = _self._arBoxes[i]
                if (item_mc.id == randomNum) {
                    item_mc.openBox(true)
                } else {
                    item_mc.openBox(false)
                }
            }
        })
        this.cb.call(2500, function () {
            _self.fixResult(win)
        })
    }

    fixResult(win) {
        this._idBox = 0
        if (win) {
            this.showWndWin()
        } else {
            // Game Over
            this.closeGame(this)
            this.showTutorial(4)
        }
    }
}