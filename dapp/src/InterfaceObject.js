import * as PIXI from 'pixi.js'
import API from "./API.js"

export default class InterfaceObject extends PIXI.Container {
    constructor() {
        super();

        this.arButtons = [];
    }

    initData () {
        this.interactive = true;
        this.on('mousedown', this.touchHandler);
        this.on('mousemove', this.touchHandler);
        this.on('mouseup', this.touchHandler);
        this.on('touchstart', this.touchHandler);
        this.on('touchmove', this.touchHandler);
        this.on('touchend', this.touchHandler);
    }

    clickObj (item_mc) {
        if (item_mc._disabled) {
            return;
        }
        item_mc._selected = false;
        if (item_mc.over) {
            item_mc.over.visible = false;
        }
        if (item_mc.overSc) {
            item_mc.scale.x = 1 * item_mc.sc;
            item_mc.scale.y = 1 * item_mc.sc;
        }
    }

    checkButtons (evt) {
        let mouseX = evt.data.global.x - this.x
        let mouseY = evt.data.global.y - this.y;
        for (let i = 0; i < this.arButtons.length; i++) {
            let item_mc = this.arButtons[i];
            if (API.hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)) {
                if (item_mc.visible &&
                    item_mc._selected == false &&
                    !item_mc._disabled) {
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
    }

    touchHandler (evt) {
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
            this.checkButtons(evt);
        } else if (phase == 'mouseup' || phase == 'touchend') {
            for (i = 0; i < this.arButtons.length; i++) {
                item_mc = this.arButtons[i];
                if (item_mc.visible && item_mc._selected) {
                    this.clickObj(item_mc);
                    return;
                }
            }
        }
    }

    removeAllListener () {
        this.interactive = false;
        this.off('mousedown', this.touchHandler);
        this.off('mousemove', this.touchHandler);
        this.off('mouseup', this.touchHandler);
        this.off('touchstart', this.touchHandler);
        this.off('touchmove', this.touchHandler);
        this.off('touchend', this.touchHandler);
    }
}