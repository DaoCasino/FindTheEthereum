import InterfaceObject from "./InterfaceObject.js"
import API from "./API.js"

export default class WndNetwork extends InterfaceObject {
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

        let start = -60
        let offset = 60

        let mainnet = API.addButtonGr("mainnet", 0, start + offset*0, "mainnet", 200, 40, 24)
        this.addChild(mainnet);
        this.arButtons.push(mainnet);
        let ropsten = API.addButtonGr("ropsten", 0, start + offset * 1, "ropsten", 200, 40, 24)
        this.addChild(ropsten);
        this.arButtons.push(ropsten);
        let rinkeby = API.addButtonGr("rinkeby", 0, start + offset * 2, "rinkeby", 200, 40, 24)
        this.addChild(rinkeby);
        this.arButtons.push(rinkeby);
        let local = API.addButtonGr("local", 0, start + offset * 3, "local", 200, 40, 24)
        this.addChild(local);
        this.arButtons.push(local);

        mainnet.setDisabled(true);

        let tfDesc = API.addText(API.getText("select_network"), 34, "#ED9829", undefined, "center", 500)
        tfDesc.y = -150;
        this.addChild(tfDesc);
    }

    show(callback) {
        this._callback = callback;
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