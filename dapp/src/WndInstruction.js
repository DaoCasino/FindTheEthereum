import InterfaceObject from "./InterfaceObject.js"
import API from "./API.js"

export default class WndInstruction extends InterfaceObject {
    constructor(prnt) {
        super();

        this.initData();

        this.prnt = prnt;

        let rect = new PIXI.Graphics();
        rect.beginFill(0x000000).drawRect(-API._W / 2, -API._H / 2, API._W, API._H).endFill();
        rect.alpha = 0.5;
        this.addChild(rect);
        let bg = API.addObj("bgWndInfo", 0, 0, 2);
        this.addChild(bg);

        let btnOk = API.addButton("btnOk", 0, 300, 0.75);
        btnOk.overSc = true;
        this.addChild(btnOk);
        this.arButtons.push(btnOk);

        let tfTitle = API.addText(API.getText("instruction"), 50, "#ED9829", undefined, "center", 500)
        tfTitle.y = -330;
        this.addChild(tfTitle);
        let tfDesc = API.addText("", 26, "#ED9829", undefined, "center", 500)
        tfDesc.y = -120;
        this.addChild(tfDesc);

        let arIcons = [
            { name: "btnCashout", title: "cashout" },
            { name: "btnHistory", title: "history_game" },
            { name: "btnContract", title: "contract" },
            //{ name: "btnFullscreen", title: "fullscreen" },
            //{ name: "btnDao", title: "site" }
        ];
        let xPos = 0;
        let yPos = 0;

        for (let i = 0; i < arIcons.length; i++) {
            this.addIco(arIcons[i], xPos, yPos);
            xPos++;
            if (xPos % 2 == 0) {
                xPos = 0;
                yPos++;
            }
        }
    }

    show(callback) {
        this._callback = callback;
    }

    addIco(obj, x, y) {
        let xStart = -400;
        let yStart = -120;
        let ico = API.addObj(obj.name, xStart + x * 450, yStart + y * 150, 1);
        this.addChild(ico);

        let tfTitle = API.addText(API.getText(obj.title), 30, "#FFCC00", undefined, "left", 300)
        tfTitle.x = ico.x + ico.width / 2 + 10;
        tfTitle.y = ico.y - ico.height / 2 + 10;
        this.addChild(tfTitle);
        let tfDesc = API.addText(API.getText("desc_" + obj.title), 26, "#FFFFFF", undefined, "left", 300)
        tfDesc.x = ico.x + ico.width / 2 + 10;
        tfDesc.y = tfTitle.y + tfTitle.height / 2 + 20;
        this.addChild(tfDesc);
    }

    clickObj(item_mc) {
        item_mc._selected = false;
        if (item_mc.over) {
            item_mc.over.visible = false;
        }
        if (item_mc.overSc) {
            item_mc.scale.x = 1 * item_mc.sc;
            item_mc.scale.y = 1 * item_mc.sc;
        }

        this.prnt.closeWindow(this);
        if (this._callback) {
            this._callback();
        }
    }
}