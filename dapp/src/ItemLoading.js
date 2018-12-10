import * as PIXI from 'pixi.js'
import API from "./API.js"

export default class ItemLoading extends PIXI.Container {
    constructor(prnt) {
        super();

        this._arCircles = [];
        this._timeStep = 0;
        this._num = 0;

        let w = 200;
        let count = 6;
        let step = w / count;

        for (let i = 0; i < 6; i++) {
            let circle = API.addObj("pointDark");
            circle.x = - w / 2 + step * i;
            this.addChild(circle);
            this._arCircles.push(circle);
        }

        this._pointLight = API.addObj("pointLight");
        this._pointLight.x = - w / 2;
        this.addChild(this._pointLight);
    }

    update(diffTime) {
        this._timeStep += diffTime;
        if (this._timeStep > 150) {
            this._timeStep = 0;
            var prevNum = this._num - 1;
            if (prevNum < 0) {
                prevNum = this._arCircles.length - 1;
            }
            var circle = this._arCircles[this._num];
            this._pointLight.x = circle.x;

            this._num++;
            if (this._num >= this._arCircles.length) {
                this._num = 0;
            }
        }
    }
}