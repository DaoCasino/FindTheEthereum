import * as PIXI from 'pixi.js'
import API from "./API.js"

export default class ItemTutorial extends PIXI.Container {
    constructor() {
        super();

        let pirateHead = API.addObj("pirateTitle", 0, 0, 0.65, -1);
        this.addChild(pirateHead);
        this.itemDialog = API.addObj("itemDialog", -230, -180);
        this.addChild(this.itemDialog);
        this.tfDesc = API.addText("", 24, "#000000", undefined, "center", 300);
        this.tfDesc.x = this.itemDialog.x - 30;
        this.tfDesc.y = this.itemDialog.y - this.tfDesc.height / 2 - 2;
        this.addChild(this.tfDesc);

        this.w = pirateHead.w + this.itemDialog.w;
        this.h = pirateHead.h;
    }

    show(str) {
        this.tfDesc.setText(str);
        this.tfDesc.y = this.itemDialog.y - this.tfDesc.height / 2 - 2;
    }

}