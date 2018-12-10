import * as PIXI from 'pixi.js'
import API from "./API.js"
import MovieClip from "./MovieClip.js"

export default class ItemResult extends MovieClip {
    constructor(value, _x, _y, delay=60) {
        super();

        this.a = new PIXI.Container();
        this.addChild(this.a);

        let str = API.getText("lose");
        let color = "#FFFFFF";
        if (value) {
            str = API.getText("win");
            color = "#ED9829";
        }
        let tf = API.addText(str, 70, color, "#0000000", "center", 300, 4);
        this.a.addChild(tf);

        this.d = delay
        this.alpha = 0
        this.x = _x;
        this.y = _y;
        this.yy = _y - 50;

        API.arClips.push(this);
    }

    loop() {
        if (this.d > 10) {
            this.y = this.y + (this.yy - this.y) / 4;
            this.alpha = Math.min(1, this.alpha + 0.1)
        } else {
            this.y -= 3;
            this.alpha = Math.max(0, this.alpha - 0.1)
        }
        this.d-- , !this.d ? (this.die()) : (undefined);
    }

}