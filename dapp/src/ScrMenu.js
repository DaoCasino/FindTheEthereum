import DCWebapi from "dc-webapi"
import InterfaceObject from "./InterfaceObject.js"
import WndInstruction from "./WndInstruction.js"
import WndNetwork from "./WndNetwork.js"
import API from "./API.js"

export default class Menu extends InterfaceObject {
    constructor() {
        super();

        this.initData();

        let bg = API.addObj("bgMenu", API._W / 2, API._H / 2);
        let scaleBack = API._W / bg.w;
        bg.scale.x = scaleBack;
        bg.scale.y = scaleBack;
        this.addChild(bg);
        let bgDark = API.addObj("bgDark", API._W / 2, API._H / 2)
        bgDark.scale.x = scaleBack
        bgDark.scale.y = scaleBack
        this.addChild(bgDark)
        let tableLogo = API.addObj("tableLogoMenuNew")
        tableLogo.scale.x = scaleBack
        tableLogo.scale.y = scaleBack
        tableLogo.x = 1000 * scaleBack
        tableLogo.y = 546 * scaleBack
        this.addChild(tableLogo)
        
        let titleGame = API.addObj("titleGame", 1550, 220)
        this.addChild(titleGame)
        let pirateTitle = API.addObj("pirateTitle", 350, 650)
        this.addChild(pirateTitle)

        this.createGui()
    }

    createGui() {
        let tfVersion = API.addText(API.version, 24, "#ffffff", "#000000", "right", 400, 4);
        tfVersion.x = API._W - 30;
        tfVersion.y = API._H - tfVersion.height - 10;
        this.addChild(tfVersion);

        let logoDaoCasino = API.addObj("newLogoDaoCasino", 180, 980);
        this.addChild(logoDaoCasino);
        
        let btnStart = API.addButton("btnText", API._W / 2, 950);
        btnStart.name = "btnStart"
        btnStart.overSc = true;
        this.addChild(btnStart);
        this.arButtons.push(btnStart);
        let tfStart = API.addText(API.getText("start"), 50, "#FFFFFF", undefined, "center", 700);
        tfStart.x = 0;
        tfStart.y = -tfStart.height / 2;
        btnStart.addChild(tfStart);
        this.btnStart = btnStart;
        
        let btnFacebook = API.addButton("btnFacebook", 1870, 48);
        btnFacebook.overSc = true;
        this.addChild(btnFacebook);
        this.arButtons.push(btnFacebook);
        let btnTwitter = API.addButton("btnTwitter", 1870, 123);
        btnTwitter.overSc = true;
        this.addChild(btnTwitter);
        this.arButtons.push(btnTwitter);
    }

    showTutor(){
        this.btnStart.setDisabled(true);
        
        if (this.wndInfo == undefined) {
            this.wndInfo = new WndInstruction(this);
            this.wndInfo.x = API._W / 2;
            this.wndInfo.y = API._H / 2;
            this.addChild(this.wndInfo);
        }

        this.wndInfo.show(this.startGame)
        this.wndInfo.visible = true;
        this.curWindow = this.wndInfo;
    }

    // CLOSE
    closeWindow(wnd) {
        if (wnd) {
            this.curWindow = wnd;
        }
        if (this.curWindow) {
            this.curWindow.visible = false;
            this.curWindow = undefined;
        }
    }

    // CLICK
    clickStart() {
        this.showTutor();
    }

    startGame() {
        this.removeAllListener()
        API.addScreen("ScrGame");
    }

    clickFB() {
        let url = "https://www.facebook.com/DAO.Casino/";
        window.open(url, "_blank")
    }

    clickTwitter() {
        let url = "https://twitter.com/daocasino";
        window.open(url, "_blank")
    }

    clickObj (item_mc) {
        if (item_mc._disabled) {
            return;
        }
        if (item_mc.overSc) {
            item_mc.scale.x = 1 * item_mc.sc;
            item_mc.scale.y = 1 * item_mc.sc;
        }

        item_mc._selected = false;
        if (item_mc.name == "btnStart") {
            this.clickStart();
        } else if (item_mc.name == "btnDao") {
            this.removeAllListener();
            // var url = "https://platform.dao.casino/";
            var url = "/";
            window.open(url, "_self");
        } else if (item_mc.name == "btnFacebook") {
            this.clickFB();
        } else if (item_mc.name == "btnTwitter") {
            this.clickTwitter();
        }
    }

    update(/*diffTime*/) {
        //console.log('diffTime:', diffTime)
        if (API.options_pause) {
            return;
        }
    }
}