import InterfaceObject from "./InterfaceObject.js"
import API from "./API.js"

export default class WndDeposit extends InterfaceObject {
    constructor(prnt, 
        style = {
            bg: "bgWndDeposit",
            colorDesc: "#ED9829"
        }) {
        super();

        this.initData();

        this.prnt = prnt;
        this._curBet = 0;
        this._maxBet = 0;
        this._stX = -248;
        this._endX = 248;

        let rect = new PIXI.Graphics();
        rect.beginFill(0x000000).drawRect(-API._W / 2, -API._H / 2, API._W, API._H).endFill();
        rect.alpha = 0.5;
        this.addChild(rect);
        let bg = API.addObj(style.bg);
        this.addChild(bg);
        let posLineY = 50;
        let thinLine = API.addObj("lineScrollM", 0, posLineY);
        this.addChild(thinLine);
        let fatLine = API.addObj("lineScrollB", 0, posLineY);
        this.addChild(fatLine);

        this._fatLine = new PIXI.Graphics();
        this._fatLine.lineStyle(20, 0xFFFF57)
        this._fatLine.moveTo(this._stX, posLineY)
            .lineTo(this._endX, posLineY);
        this.addChild(this._fatLine);
        this._fatLine.scale.x = 0;
        fatLine.mask = this._fatLine;

        let scrollZone = new PIXI.Container();
        this.addChild(scrollZone);
        let zone = new PIXI.Graphics();
        zone.beginFill(0xFF0000).drawRect(0, 0, this._endX - this._stX, posLineY).endFill();
        zone.x = -zone.width / 2;
        zone.y = -zone.height / 2;
        scrollZone.addChild(zone);
        scrollZone.y = posLineY;
        scrollZone.w = this._endX - this._stX;
        scrollZone.h = posLineY;
        scrollZone.name = "scrollZone";
        scrollZone.visible = false;
        scrollZone._selected = false;
        this.arButtons.push(scrollZone);

        this._btnOk = API.addButton("btnOk", 0, 140, 0.75);
        this._btnOk.overSc = true;
        this._btnOk.setDisabled(true);
        this.addChild(this._btnOk);
        this.arButtons.push(this._btnOk);
        this._headScroll = API.addObj("headScroll", this._stX, posLineY);
        this._headScroll._selected = false;
        this._headScroll._disabled = false;
        this._headScroll.interactive = true;
        this._headScroll.buttonMode = true;
        this.addChild(this._headScroll);
        this.arButtons.push(this._headScroll);

        this._tfDesc = API.addText("", 26, style.colorDesc, undefined, "center", 500, 3)
        this._tfDesc.y = -132;
        this.addChild(this._tfDesc);
        this._tfBet = API.addText("0 BET", 40, "#FFFFFF", undefined, "center", 350, 4)
        this._tfBet.y = -5 - this._tfBet.height / 2;
        this.addChild(this._tfBet);
    }

    show(str, callback, maxBet) {
        this._callback = callback;
        this._tfDesc.setText(str);
        this._maxBet = Math.min(maxBet, 100);
        if (this._curBet == 0) {
            this._curBet = Number(this._maxBet / 10) || 1;
            this._curBet = 1;
        }
        let posX = this._stX + (this._curBet / this._maxBet) * this._endX * 2;
        this._headScroll.x = posX;
        let sc = (posX + this._endX) / (this._endX * 2);
        this._fatLine.x = this._stX + this._endX * sc;
        this._fatLine.scale.x = sc;

        if (this._curBet > this._maxBet) {
            this._curBet = this._maxBet;
            this._headScroll.x = this._endX;
            this._fatLine.x = 0;
            this._fatLine.scale.x = 1;
        }
        
        this._tfBet.setText(String(this._curBet) + " BET");
        if (posX > this._stX && this._curBet >= 0.01) {
            this._btnOk.setDisabled(false);
        }
    }

    clickObj(item_mc, evt) {
        let name = item_mc.name
        item_mc._selected = false;
        if (item_mc.over) {
            item_mc.over.visible = false;
        }
        if (item_mc.overSc) {
            item_mc.scale.x = 1 * item_mc.sc;
            item_mc.scale.y = 1 * item_mc.sc;
        }

        if (name == "btnOk") {
            this.prnt.closeWindow(this);
            if (this._callback) {
                this._callback(this._curBet);
            }
        } else if (name == "scrollZone") {
            this.scrollHead(evt);
        }
    }

    scrollHead(evt) {
        let mouseX = evt.data.global.x - this.x;
        let posX = Math.max(mouseX, this._stX);
        posX = Math.min(posX, this._endX);
        this._headScroll.x = posX;

        let sc = (posX + this._endX) / (this._endX * 2);
        this._fatLine.x = this._stX + this._endX * sc;
        this._fatLine.scale.x = sc;

        this._curBet = (sc * this._maxBet);
        let value = this._curBet;
        // value = _self.roundBet(value*100)
        value = Math.round(value)
        this._curBet = value;
        this._tfBet.setText(String(value) + " BET");

        if (posX > this._stX && value >= 0.01) {
            this._btnOk.setDisabled(false);
        } else {
            this._btnOk.setDisabled(true);
        }
    }

    checkButtons(evt) {
        let phase = evt.type;
        let mouseX = evt.data.global.x - this.x
        let mouseY = evt.data.global.y - this.y;
        for (let i = 0; i < this.arButtons.length; i++) {
            let item_mc = this.arButtons[i];
            if (API.hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)) {
                if ((item_mc.visible || item_mc.name == "scrollZone") &&
                    item_mc._selected == false && !item_mc._disabled) {
                    item_mc._selected = true;
                    if (item_mc.over) {
                        item_mc.over.visible = true;
                    } else if (item_mc.overSc) {
                        item_mc.scale.x = 1.1 * item_mc.sc;
                        item_mc.scale.y = 1.1 * item_mc.sc;
                    }
                }
            } else {
                if (item_mc._selected) {
                    item_mc._selected = false;
                    if (item_mc.over) {
                        item_mc.over.visible = false;
                    } else if (item_mc.overSc) {
                        item_mc.scale.x = 1 * item_mc.sc;
                        item_mc.scale.y = 1 * item_mc.sc;
                    }
                }
            }
        }

        if ((phase == 'touchstart' || phase == 'mousedown') && this._headScroll._selected) {
            this._pressHead = true;
        }
    }

    touchHandler(evt) {
        if (!this.visible) {
            return false;
        }
        // mousedown , mousemove, mouseup
        // touchstart, touchmove, touchend
        let phase = evt.type;
        let item_mc; //MovieClip
        let i = 0;

        if (phase == 'mousemove' || phase == 'touchmove' ||
            phase == 'touchstart' || phase == 'mousedown') {
            if (this._pressHead) {
                this.scrollHead(evt);
                return;
            }
            this.checkButtons(evt);
        } else if (phase == 'mouseup' || phase == 'touchend') {
            this._pressHead = false;
            for (i = 0; i < this.arButtons.length; i++) {
                item_mc = this.arButtons[i];
                if ((item_mc.visible || item_mc.name == "scrollZone") && item_mc._selected) {
                    this.clickObj(item_mc, evt);
                    return;
                }
            }
        }
    }
}