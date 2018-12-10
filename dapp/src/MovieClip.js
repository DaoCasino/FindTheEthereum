import * as PIXI from 'pixi.js'
import API from "./API.js"

export default class MovieClip extends PIXI.Container {
    constructor() {
        super();

        this.a, this.zone, this.it, this.sh;
        this.energy, this.energymax, this.wid, this.hei, this.hwid, this.hhei, this.d;
        this.act, this.actnow;
        this.z = {};

        // create empty MovieClip 'a' if not available
        if (!this.a) {
            this.a = new PIXI.Container()
            this.addChild(this.a);
        }
        this.energy = this.energymax = 100
        this.setsize(0, 0)
        this.z = {}
        this.zone ? (this.zone.visible = false) : (undefined);
        this.added();
    }

    // show act
    showact() {
        if (this.act != this.actnow) {
            this.actnow = this.act;
        }
    }

    // set size
    setsize(ww, hh) {
        this.wid = ww;
        this.hei = hh;
        this.hwid = this.wid / 2;
        this.hhei = this.hei / 2;
    }

    // set zone (based on parent's coordinates)
    setzone(xx, yy, wid, hei, draw) {
        this.z.x = this.x + xx
        this.z.y = this.y + yy
        this.zone.x = xx
        this.zone.y = yy
        this.z.width = this.zone.width = this.wid
        this.z.height = this.zone.height = this.hei
        draw ? (this.zone.visible = true) : (undefined)
    }

    // added
    added() {
        this.setlisteners()
    }

    // loop
    loop() {
    }

    // removed
    removed() {
    }

    // cek die
    cekdie() {
        !this.energy ? (this.die()) : (undefined)
    }

    // add shadow
    addshadow(nama) {
    }

    // update shadow
    updateshadow() {
        sh.x = x
        sh.y = y
    }

    // set listeners
    setlisteners() {
    }

    // enter_frame
    enter_frame() {
        !API.options_pause ? (this.loop()) : (undefined)
    }

    // removed_from_stage
    removed_from_stage() {
        this.removed()
        this.clearlistener()
        this.sh ? (this.sh.parent.removeChild(this.sh)) : (undefined) // remove shadow
    }

    removevalue(value, arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] == value ? (arr = arr.splice(i, 1)) : (undefined);
        }
    }

    // clear listener
    clearlistener() {
    }

    // die
    die() {
        this.removevalue(this, API.arClips);
        if (this.parent) {
            this.parent.removeChild(this)
        }
    }
}