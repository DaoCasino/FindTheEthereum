import InterfaceObject from "./InterfaceObject.js"
import API from "./API.js"

export default class WndWin extends InterfaceObject {
    constructor(prnt) {
        super();

        this.initData();

        this.prnt = prnt;

        let rect = new PIXI.Graphics();
        rect.beginFill(0x000000).drawRect(-API._W / 2, -API._H / 2, API._W, API._H).endFill();
        rect.alpha = 0.5;
        this.addChild(rect);
        let bg = API.addObj("bgWndInfo");
        this.addChild(bg);

        let btnOk = API.addButton("btnOk", 0, 150, 0.75);
        btnOk.overSc = true;
        this.addChild(btnOk);
        this.arButtons.push(btnOk);

        let tfWin = API.addText(API.getText("congratulations"), 50, "#ED9829", undefined, "center", 500, 3)
        tfWin.y = -120;
        this.addChild(tfWin);

        this._tfDesc = API.addText("", 50, "#5AB63E", undefined, "center", 500, 3)
        this._tfDesc.y = 0;
        this.addChild(this._tfDesc);
    }

    show(str, callback) {
        this._callback = callback;
        this._tfDesc.setText(str);
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
            this._callback(this.prnt);
        }
    }

}