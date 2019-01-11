import * as PIXI from 'pixi.js'
import LangEn from "./LangEn.js"
import ScrMenu from "./ScrMenu.js"
import ScrGame from "./ScrGame.js"

class _API extends PIXI.Container {
    constructor() {
        super();
        
        this.version = "1.0.1";
        this._W = 1920;
        this._H = 1080;
        this.globalScale = 1;
        this.renderSize = 1;
        this.stageScale = 1;
        this.network = "ropsten"
        this.dataAnima = [];
        this.dataMovie = [];
        this.arClips = [];
        this.options_pause = false;
        this.options_debug = false;
        this.options_platform = window.self !== window.top;

        this.colorFilter = new PIXI.filters.ColorMatrixFilter();
        this.colorFilter.desaturate();
    }

    setContainer(scrContainer) {
        this.scrContainer = scrContainer;
    }

    addScreen(name) {
        if (this.scrContainer) {
            this.scrContainer.removeChild(this.currentScreen);
            this.currentScreen = null;
        }
        switch (name) {
            case "ScrMenu":
                this.currentScreen = new ScrMenu();
                break;
            case "ScrGame":
                this.currentScreen = new ScrGame();
                break;

            default:
                break;
        }

        this.scrContainer.addChild(this.currentScreen);
        this.currentScreen.name = name
    }
    
    addObj(name,
        _x = 0,
        _y = 0,
        _scGr = 1,
        _scaleX = 1,
        _scaleY = 1) {

        let obj = new PIXI.Container();
        obj.scale.x = _scGr * _scaleX;
        obj.scale.y = _scGr * _scaleY;

        let objImg = null;
        
        if (this.dataAnima[name]) {
            objImg = new PIXI.Sprite(this.dataAnima[name]);
        } else if (this.dataMovie[name]) {
            objImg = new PIXI.extras.MovieClip(this.dataMovie[name]);
            objImg.stop();
        } else {
            let data = PIXI.loader.resources[name];
            if (data) {
                objImg = new PIXI.Sprite(data.texture);
            } else {
                return null;
            }
        }
        if (objImg.anchor) {
            objImg.anchor.x = 0.5;
            objImg.anchor.y = 0.5;
        }
        obj.w = objImg.width * obj.scale.x;
        obj.h = objImg.height * obj.scale.y;
        obj.addChild(objImg);
        obj.x = _x;
        obj.y = _y;
        obj.name = name;
        obj.img = objImg;
        obj.r = obj.w / 2;
        obj.rr = obj.r * obj.r;

        obj.setReg0 = function () {
            if (objImg.anchor) {
                objImg.anchor.x = 0;
                objImg.anchor.y = 0;
            }
        }
        obj.setRegX = function (procx) {
            if (objImg.anchor) {
                objImg.anchor.x = procx;
            }
        }
        obj.setRegY = function (procy) {
            if (objImg.anchor) {
                objImg.anchor.y = procy;
            }
        }

        return obj;
    }

    addText(text,
        size = 24,
        color = "#FFFFFF",
        glow = undefined,
        _align = "center",
        width = 600,
        px = 2,
        font = "Tahoma") {

        let style;
        
        if (glow) {
            style = {
                font: size + "px " + font,
                fill: color,
                align: _align,
                stroke: glow,
                strokeThickness: px,
                wordWrap: true,
                wordWrapWidth: width
            };
        } else {
            style = {
                font: size + "px " + font,
                fill: color,
                align: _align,
                wordWrap: true,
                wordWrapWidth: width
            };
        }

        let obj = new PIXI.Container();

        let tfMain = new PIXI.Text(text, style);
        tfMain.y = 0;
        obj.addChild(tfMain);
        if (_align == "left") {
            tfMain.x = 0;
        } else if (_align == "right") {
            tfMain.x = -tfMain.width;
        } else {
            tfMain.x = - tfMain.width / 2;
        }

        obj.width = Math.ceil(tfMain.width);
        obj.height = Math.ceil(tfMain.height);

        obj.setText = function (value) {
            tfMain.text = value;
            if (_align == "left") {
                tfMain.x = 0;
            } else if (_align == "right") {
                tfMain.x = -tfMain.width;
            } else {
                tfMain.x = - tfMain.width / 2;
            }
        };

        obj.getText = function () {
            return tfMain.text;
        };

        return obj;
    }

    addGraphic(_x, _y, _w = 100, _h = 100, _color = 0xFF0000) {
        let obj = new PIXI.Container();

        let objImg = new PIXI.Graphics();
        objImg.beginFill(_color).drawRect(-_w / 2, -_h / 2, _w, _h).endFill();
        obj.addChild(objImg);

        obj.x = _x;
        obj.y = _y;
        obj.w = _w;
        obj.h = _h;

        return obj;
    }

    addButtonGr(_name, 
        _x = 0, 
        _y = 0, 
        _title, 
        _w = 200, 
        _h = 70, 
        _sizeTF = 30, 
        _color = 0xFFC893, 
        _colorOver = 0xFFF7D2) {
        let obj = new PIXI.Container();

        let objImg = new PIXI.Graphics();
        objImg.beginFill(_color).drawRect(-_w / 2, -_h / 2, _w, _h).endFill();
        obj.addChild(objImg);
        obj.over = new PIXI.Graphics();
        obj.over.beginFill(_colorOver).drawRect(-_w / 2, -_h / 2, _w, _h).endFill();
        obj.over.visible = false;
        obj.addChild(obj.over);
        obj.lock = new PIXI.Graphics();
        obj.lock.beginFill(0x999999).drawRect(-_w / 2, -_h / 2, _w, _h).endFill();
        obj.lock.visible = false;
        obj.addChild(obj.lock);

        if (_title) {
            obj.tf = API.addText(_title, _sizeTF, "#000000", undefined, "center", _w - 20, 4);
            obj.tf.x = 0;
            obj.tf.y = -obj.tf.height / 2;
            obj.addChild(obj.tf);
        }

        obj.sc = 1;
        obj.x = _x;
        obj.y = _y;
        obj.w = _w;
        obj.h = _h;
        obj.r = obj.w / 2;
        obj.rr = obj.r * obj.r;
        obj.name = _name;
        obj._selected = false;
        obj._disabled = false;
        obj.interactive = true;
        obj.buttonMode = true;
        if (obj.w < 50) {
            obj.w = 50;
        }
        if (obj.h < 50) {
            obj.h = 50;
        }

        obj.setDisabled = function (value) {
            obj._disabled = value;
            obj.lock.visible = value;
        };

        return obj;
    }

    addButton(name, 
        _x = 0, 
        _y = 0, 
        _scGr = 1, 
        _scaleX = 1, 
        _scaleY = 1) {
        let obj = new PIXI.Container();

        let objImg = null;
        let _self = this;
        obj.setImg = function (name) {
            objImg = _self.addObj(name);
            obj.img = objImg;
            obj.addChild(objImg);
            obj.over = _self.addObj(name + "Over");
            if (obj.over) {
                obj.over.visible = false;
                obj.addChild(obj.over);
            } else {
                obj.over = null;
            }

            obj.sc = _scGr;
            obj.scale.x = _scGr * _scaleX;
            obj.scale.y = _scGr * _scaleY;
            obj.vX = _scaleX;
            obj.vY = _scaleY;
            obj.x = _x;
            obj.y = _y;
            obj.w = objImg.width * _scGr;
            obj.h = objImg.height * _scGr;
            obj.r = obj.w / 2;
            obj.rr = obj.r * obj.r;
            obj.name = name;
            obj._selected = false;
            obj._disabled = false;
            obj.interactive = true;
            obj.buttonMode = true;
            if (obj.w < 50) {
                obj.w = 50;
            }
            if (obj.h < 50) {
                obj.h = 50;
            }
        };

        obj.setDisabled = function (value) {
            obj._disabled = value;
            /*if (value) {
                obj.img.filters = [this.colorFilter];
            } else {
                obj.img.filters = [];
            }*/
        };

        obj.setAplhaDisabled = function (value) {
            obj._disabled = value;
            if (value) {
                obj.alpha = 0.5;
            } else {
                obj.alpha = 1;
            }
        };

        obj.setImg(name);

        return obj;
    }

    getText(txt) {
        return LangEn.getText(txt);
        //return txt;
    }

    get_dd(p1, p2) {
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        return dx * dx + dy * dy;
    }
    getDD(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return dx * dx + dy * dy;
    }
    hit_test(mc, rr, tx, ty) {
        let dx = mc.x - tx;
        let dy = mc.y - ty;
        let dd = dx * dx + dy * dy;
        if (dd < rr) {
            return true;
        }
        return false;
    }
    hit_test_rec(mc, w, h, tx, ty) {
        if (tx > mc.x - w / 2 && tx < mc.x + w / 2) {
            if (ty > mc.y - h / 2 && ty < mc.y + h / 2) {
                return true;
            }
        }
        return false;
    }
}

const API = new _API();
export default API;