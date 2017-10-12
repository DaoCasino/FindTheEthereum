/**
 * Created by DAO.casino
 * Treasure Of DAO - WndWin
 * v 1.0.0
 */

/*eslint no-undef: "none"*/

var WndWin = function(prnt){
	PIXI.Container.call( this );
	
	var _self = this;
	var _callback;
	var _arButtons = [];
	var _btnOk;
	var _tfDesc;
	
	// INIT
	_self.init = function(){
		var rect = new PIXI.Graphics();
		rect.beginFill(0x000000).drawRect(-_W/2, -_H/2, _W, _H).endFill();
		rect.alpha = 0.5;
		_self.addChild(rect);
		var bg = addObj("bgWndInfo");
		_self.addChild(bg);
		
		_btnOk = addButton("btnOk", 0, 150, 0.75);
		_btnOk.overSc = true;
		_self.addChild(_btnOk);
		_arButtons.push(_btnOk);
		
		var tfWin = addText(getText("congratulations"), 50, "#ED9829", undefined, "center", 500, 3)
		tfWin.y = -120;
		_self.addChild(tfWin);
		
		_tfDesc = addText("", 50, "#5AB63E", undefined, "center", 500, 3)
		_tfDesc.y = 0;
		_self.addChild(_tfDesc);
	
		_self.interactive = true;
		_self.on('mousedown', _self.touchHandler);
		_self.on('mousemove', _self.touchHandler);
		_self.on('mouseup', _self.touchHandler);
		_self.on('touchstart', _self.touchHandler);
		_self.on('touchmove', _self.touchHandler);
		_self.on('touchend', _self.touchHandler);
	}
	
	_self.show = function(str, callback) {
		_callback = callback;
		_tfDesc.setText(str);
	}
	
	_self.clickObj = function(item_mc) {
		var name = item_mc.name
		item_mc._selected = false;
		if(item_mc.over){
			item_mc.over.visible = false;
		}
		if(item_mc.overSc){
			item_mc.scale.x = 1*item_mc.sc;
			item_mc.scale.y = 1*item_mc.sc;
		}
		
		prnt.closeWindow(_self);
		if(_callback){
			_callback();
		}
	}
	
	_self.checkButtons = function(evt){
		var phase = evt.type; 
		var mouseX = evt.data.global.x - _self.x
		var mouseY = evt.data.global.y - _self.y;
		for (var i = 0; i < _arButtons.length; i++) {
			var item_mc = _arButtons[i];
			if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)){
				if(item_mc.visible && 
				item_mc._selected == false && 
				!item_mc._disabled){
					item_mc._selected = true;
					if(item_mc.over){
						item_mc.over.visible = true;
					} else if(item_mc.overSc){
						item_mc.scale.x = 1.1*item_mc.sc;
						item_mc.scale.y = 1.1*item_mc.sc;
					}
				}
			} else {
				if(item_mc._selected){
					item_mc._selected = false;
					if(item_mc.over){
						item_mc.over.visible = false;
					} else if(item_mc.overSc){
						item_mc.scale.x = 1*item_mc.sc;
						item_mc.scale.y = 1*item_mc.sc;
					}
				}
			}
		}
	}
	
	_self.touchHandler = function(evt){	
		if(!_self.visible){
			return false;
		}
		// mousedown , mousemove, mouseup
		// touchstart, touchmove, touchend
		var phase = evt.type; 
		var item_mc; //MovieClip
		var i = 0;
		
		if(phase=='mousemove' || phase == 'touchmove' || 
		phase == 'touchstart' || phase == 'mousedown'){
			_self.checkButtons(evt);
		} else if (phase == 'mouseup' || phase == 'touchend') {
			for (i = 0; i < _arButtons.length; i ++) {
				item_mc = _arButtons[i];
				if(item_mc.visible&& item_mc._selected){
					_self.clickObj(item_mc);
					return;
				}
			}
		}
	}
	
	_self.removeAllListener = function() {
		this.interactive = false;
		this.off('mousedown', this.touchHandler);
		this.off('mousemove', this.touchHandler);
		this.off('mouseup', this.touchHandler);
		this.off('touchstart', this.touchHandler);
		this.off('touchmove', this.touchHandler);
		this.off('touchend', this.touchHandler);
	}
	
	_self.init();
	
	return _self;
};

WndWin.prototype = Object.create(PIXI.Container.prototype);
WndWin.prototype.constructor = WndWin;