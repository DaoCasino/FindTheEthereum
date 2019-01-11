import * as PIXI from 'pixi.js'
import API from "./API";

export default class Main {

    constructor() {
        this._W = 1920;
        this._H = 1080;

        this.renderer = PIXI.autoDetectRenderer(this._W, this._H, { backgroundColor: 0x000000 });
        document.body.appendChild(this.renderer.view);
        this.stage = new PIXI.Container();
        this.loadBack = new PIXI.Container();
        this.stage.addChild(this.loadBack);
        this.scrContainer = new PIXI.Container();
        this.stage.addChild(this.scrContainer);
        API.setContainer(this.scrContainer);

        this.loginObj = new Object();

        this.startTime = this.getTimer()
        this.fps = 60;
        this.interval = 1000 / this.fps;
        this.fontMain = "Roboto Bold";

        this.createScreenLoader();
        this.render();
        this.loadManifest();

        window.addEventListener('resize', this.resize, false);
        this.resize();
    }

    saveData() {
        if (this.isLocalStorageAvailable()) {
            let loginStr = JSON.stringify(this.loginObj);
            localStorage.setItem('dc_fte', loginStr);
            // console.log("Saving: ok!");
        }
    }

    loadData() {
        if (this.isLocalStorageAvailable()) {
            if (localStorage.getItem('dc_fte')) {
                let loginStr = localStorage.getItem('dc_fte')
                this.loginObj = JSON.parse(loginStr);
                // console.log("Loading: ok!");
            } else {
                // console.log("Loading: fail!");
            }
        }
    }

    resetData() {
        this.loginObj = new Object();
        this.saveData();
    }

    isLocalStorageAvailable() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            console.log("localStorage_failed:", e);
            return false;
        }
    }

    createScreenLoader() {
        let w = 600;
        let h = 50;
        this.loadBack.x = this._W / 2;
        this.loadBack.y = this._H / 2;
        let frameLoading = new PIXI.Graphics();
        frameLoading.lineStyle(3, 0xFFFFFF, 1);
        frameLoading.drawRect(-w / 2, -h / 2, w, h);
        this.loadBack.addChild(frameLoading);
        let barLoading = new PIXI.Graphics();
        barLoading.beginFill(0xFFFFFF).drawRect(0, -h / 2, w, h).endFill();
        barLoading.x = - w / 2;
        this.loadBack.addChild(barLoading);
        this.loadBack.barLoading = barLoading;
        this.loadBack.barLoading.scale.x = 0;

        this.loadPercent = API.addText("loading", 32, "#FFFFFF", undefined, "center", 500, 3)
        this.loadPercent.x = 0;
        this.loadPercent.y = 100;
        this.loadBack.addChild(this.loadPercent);
    }

    loadManifest() {
        let loader = PIXI.loader;
        this.loader = loader;
        let _self = this
        loader
            .add("bgMenu", require('../img/bg/bgMenu.jpg'))
            .add("bgGame", require('../img/bg/bgGame.jpg'))
            .add("bgDark", require("../img/bg/bgDark.png"))
            .add("bgWndDeposit", require("../img/bg/bgWndDeposit.png"))
            .add("bgWndInfo", require("../img/bg/bgWndInfo.png"))
            .add("bgWndWarning", require("../img/bg/bgWndWarning.png"))
            .add("bgWndWS", require("../img/bg/bgWndWS.png"))
            .add("bgWndWS1", require("../img/bg/bgWndWS1.png"))
            .add("bgWndBet", require("../img/bg/bgWndBet.png"))
            
            .add("boxEmpty", require("../img/boxes/boxEmpty.png"))
            .add("boxEmptyL", require("../img/boxes/boxEmptyL.png"))
            .add("boxEmptyR", require("../img/boxes/boxEmptyR.png"))
            .add("boxGold", require("../img/boxes/boxGold.png"))
            .add("boxGoldL", require("../img/boxes/boxGoldL.png"))
            .add("boxGoldR", require("../img/boxes/boxGoldR.png"))
            .add("boxLock", require("../img/boxes/boxLock.png"))
            .add("boxLockL", require("../img/boxes/boxLockL.png"))
            .add("boxLockR", require("../img/boxes/boxLockR.png"))
            .add("boxOver", require("../img/boxes/boxOver.png"))
            .add("boxOverL", require("../img/boxes/boxOverL.png"))
            .add("boxOverR", require("../img/boxes/boxOverR.png"))

            .add("bgBet", require("../img/items/bgBet.png"))
            .add("btnCashout", require("../img/items/btnCashout.png"))
            .add("btnContract", require("../img/items/btnContract.png"))
            .add("btnFacebook", require("../img/items/btnFacebook.png"))
            .add("btnInstruct", require("../img/items/btnInstruct.png"))
            .add("btnHistory", require("../img/items/btnHistory.png"))
            .add("btnOk", require("../img/items/btnOk.png"))
            .add("btnText", require("../img/items/btnText.png"))
            .add("btnTwitter", require("../img/items/btnTwitter.png"))
            .add("icoBet", require("../img/items/icoBet.png"))
            .add("icoKey", require("../img/items/icoKey.png"))
            .add("itemBet", require("../img/items/itemBet.png"))
            .add("itemDialog", require("../img/items/itemDialog.png"))
            .add("headScroll", require("../img/items/headScroll.png"))
            .add("light", require("../img/items/light.png"))
            .add("lightL", require("../img/items/lightL.png"))
            .add("lightR", require("../img/items/lightR.png"))
            .add("lineScrollB", require("../img/items/lineScrollB.png"))
            .add("lineScrollM", require("../img/items/lineScrollM.png"))
            .add("newLogoDaoCasino", require("../img/items/newLogoDaoCasino.png"))
            .add("pirateTitle", require("../img/items/pirateTitle.png"))
            .add("pointDark", require("../img/items/pointDark.png"))
            .add("pointLight", require("../img/items/pointLight.png"))
            .add("tableLogoMenuNew", require("../img/items/tableLogoMenuNew.png"))
            .add("tableLogoGameNew", require("../img/items/tableLogoGameNew.png"))
            .add("titleGame", require("../img/items/titleGame.png"))

            //.add("../img/texture/BoxesTexture.json")
            //.add("../img/texture/ItemsTexture.json");
            //.add("BoxesTexture.json")
            //.add("ItemsTexture.json");

        // loader.onError.add(this.handleProgress.bind(this));
        loader.load(this.handleComplete.bind(this));
        loader.on('progress', function (loader, res){
            let percent = Math.round(loader.progress);
            _self.loadBack.barLoading.scale.x = percent / 100;
            if (_self.loadPercent) {
                _self.loadPercent.setText(percent + "%");
            }
            // console.log(percent)
        })
    }

    textureLoad() {
        //this.iniSetArt("../img/texture/BoxesTexture.json");
        //this.iniSetArt("../img/texture/ItemsTexture.json");
        //this.iniSetArt("BoxesTexture.json");
        //this.iniSetArt("ItemsTexture.json");
    }

    iniSet(set_name) {
        let json = this.preloader.resources[set_name]
        if (json) { } else {
            console.log("ERROR: " + set_name + " is undefined");
            return;
        }
        json = json.data;

        let jFrames = json.frames;
        let data = preloader.resources[set_name].textures;
        let dataTexture = [];
        let animOld = "";
        console.log("set_name:", set_name);

        if (data && jFrames) {
            for (let namePng in jFrames) {
                let index = namePng.indexOf(".png");
                let nameFrame = namePng;
                if (index > 1) {
                    nameFrame = namePng.slice(0, index);
                }
                console.log("nameFrame:", nameFrame, index2);

                let index2 = nameFrame.indexOf("/");
                if (index2 > 1) {
                    let type = nameFrame.slice(0, index2); // тип анимации
                    let anim = type; // имя сета
                    if (anim != animOld) {
                        animOld = anim;
                        dataTexture[anim] = [];
                    }
                    dataTexture[anim].push(PIXI.Texture.fromFrame(namePng));
                    console.log(nameFrame + ": ", anim, namePng);
                }
            }

            for (let name in dataTexture) {
                let arrayFrames = dataTexture[name]; // какие кадры используются в сети
                this.dataMovie[name] = arrayFrames;
                // console.log(name + ": ", arrayFrames);
                // console.log(name);
            }
        }
    }

    iniSetArt(set_name) {
        let json = this.loader.resources[set_name]
        //console.log("this.loader.resources", this.loader.resources)
        if (json) { } else {
            console.log("ERROR: " + set_name + " is undefined");
            return;
        }
        
        json = json.data;
        if (json) { } else {
            console.log("ERROR: " + set_name + " data is null");
            return;
        }
        let frames = json.frames;
        let data = this.loader.resources[set_name].textures;
        //console.log("set_name:", set_name);

        if (data && frames) {
            for (let namePng in frames) {
                let index = namePng.indexOf(".png");
                let nameFrame = namePng;
                if (index > 1) {
                    nameFrame = namePng.slice(0, index);
                }
                API.dataAnima[nameFrame] = data[namePng];
                //console.log("nameFrame:", nameFrame);
            }
        }
    }

    handleProgress(error, loader, resource) {
        let percent = Math.round(loader.progress);
        this.loadBack.barLoading.scale.x = percent / 100;
        if (this.loadPercent) {
            this.loadPercent.setText(percent + "%");
        }
    }

    handleComplete() {
        this.loadData();
        this.textureLoad();
        
        this.start();
    }

    render() {
        // this.container.render();
        this.renderer.render(this.stage);
        this.animate();
    }
    animate() {
        //this.container.update();
        this.renderer.render(this.stage);
        window.requestAnimationFrame(this.animate.bind(this));
        this.resize();

        let diffTime = this.getTimer() - this.startTime
        if (diffTime > this.interval) {
            if (API.currentScreen) {
                API.currentScreen.update(diffTime)
            }

            this.startTime = this.getTimer()
        }
    }
    resize(){
        if (!this.renderer) return;
        
        var realW = window.innerWidth;
        var realH = window.innerHeight;

        API.globalScale = Math.min(realW / API._W, realH / API._H);

        if (this.renderer instanceof PIXI.CanvasRenderer) {
            //isCanvas = true;
        }
        else {
            //isCanvas = false;
        }

        this.renderer.resize(API._W / API.renderSize, API._H / API.renderSize);

        this.renderer.view.style.width = API._W * API.globalScale + 'px';
        this.renderer.view.style.height = API._H * API.globalScale + 'px';

        this.renderer.view.style.position = 'absolute';
        this.renderer.view.style.left = (realW / 2 - API._W * API.globalScale / 2) + 'px';
        this.renderer.view.style.top = (realH / 2 - API._H * API.globalScale / 2) + 'px';

        this.stage.scale.x = API.stageScale;
        this.stage.scale.y = API.stageScale;
    }

    getTimer() {
        let d = new Date()
        let n = d.getTime()
        return n;
    }

    start() {
        if (this.loadBack) {
            this.stage.removeChild(this.loadBack);
        }

        API.addScreen("ScrMenu");
    }
}