import * as PIXI from 'pixi.js'
import API from "./API.js"

export default class ItemTooltip extends PIXI.Container {
    constructor(prnt) {
        super();

        let w = 250;
        let h = 100;
        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0xED9829).drawRect(-w / 2, -h / 2, w, h).endFill();
        this.bg.alpha = 0.75;
        this.addChild(this.bg);

        this.tfDesc = API.addText("", 30, "#FFFFFF", undefined, "center", w * 0.9);
        this.tfDesc.x = 0;
        this.tfDesc.y = -this.tfDesc.height / 2;
        this.addChild(this.tfDesc);

        this.w = w;
        this.h = h;
    }

    show(str) {
        this.tfDesc.setText(str);
        this.tfDesc.y = this.bg.y - this.tfDesc.height / 2;
        this.bg.height = this.tfDesc.height + 10;
    }
}