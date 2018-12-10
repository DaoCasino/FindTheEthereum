import * as PIXI from 'pixi.js'
import API from "./API.js"

export default class ItemBox extends PIXI.Container {
    constructor(prnt, name) {
        super();

        this._prnt = prnt;
        this.name = "ItemBox";
        this._selected = false;
        this._disabled = false;

        var sc = 0.75;
        var posX = 0;
        var posY = -11;
        var lightX = 0;
        var lightY = -50;
        this.w = 261 * sc;
        this.h = 185 * sc;

        if (name == "L") {
            posX = -91;
            posY = -25;
            lightX = 15;
            lightY = -110;
            this.w = 325 * sc;
            this.h = 249 * sc;
        } else if (name == "R") {
            posX = 76;
            posY = -23;
            lightX = -15;
            lightY = -110;
            this.w = 325 * sc;
            this.h = 249 * sc;
        }
        let poxOverX = posX + 0.75;
        let poxOverY = posY;
        let poxEmptyX = posX;
        let poxEmptyY = posY;
        let poxGoldX = posX;
        let poxGoldY = posY;

        this._boxLock = API.addObj("boxLock" + name, posX * sc, posY * sc, sc);
        this.addChild(this._boxLock);
        this._boxOver = API.addObj("boxOver" + name, poxOverX * sc, poxOverY * sc, sc);
        this.addChild(this._boxOver);
        this._boxGold = API.addObj("boxGold" + name, poxGoldX * sc, poxGoldY * sc, sc);
        this.addChild(this._boxGold);
        this._boxEmpty = API.addObj("boxEmpty" + name, poxEmptyX * sc, poxEmptyY * sc, sc);
        this.addChild(this._boxEmpty);
        this._boxSelected = API.addObj("light" + name, lightX, lightY);
        this.addChild(this._boxSelected);

        this.refresh();
        this.setDisabled(false);
        this.main = this._boxLock;
        this.over = this._boxOver;
    }

    setDisabled(value) {
        this._disabled = value;
        this.buttonMode = !value;
        this.interactive = !value;
    }

    setSelected(value) {
        this._boxSelected.visible = value;
    }

    openBox(value) {
        this._boxLock.visible = false;
        if (value) {
            this._boxGold.visible = true;
        } else {
            this._boxEmpty.visible = true;
        }
    }

    refresh() {
        this.setDisabled(false);
        this._boxLock.visible = true;
        this._boxGold.visible = false;
        this._boxEmpty.visible = false;
        this._boxOver.visible = false;
        this._boxSelected.visible = false;
    }
}