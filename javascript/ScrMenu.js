/**
 * Created by DAO.casino
 * Treasure Of DAO - Menu
 * v 1.0.0
 */

/*eslint no-undef: "none"*/

var ScrMenu = function(){
	PIXI.Container.call( this );
	
	var _self = this;
	var _arButtons = [];
	var _btnStart;
	
	// INIT
	_self.init = function(){
		var bg = addObj("bgMenu", _W/2, _H/2);
		scaleBack = _W/bg.w;
		bg.scale.x = scaleBack;
		bg.scale.y = scaleBack;
		_self.addChild(bg);
		var tableLogo = addObj("tableLogoMenu");
		tableLogo.scale.x = scaleBack;
		tableLogo.scale.y = scaleBack;
		tableLogo.x = 1000*scaleBack;
		tableLogo.y = 546*scaleBack;
		_self.addChild(tableLogo);
		
		var titleGame = addObj("titleGame", 1366, 261);
		_self.addChild(titleGame);
		var pirateTitle = addObj("pirateTitle", 350, 600);
		_self.addChild(pirateTitle);
		
		_self.createGui();
		
		this.interactive = true;
		this.on("mouseup", this.touchHandler);
		this.on("mousedown", this.touchHandler);
		this.on("mousemove", this.touchHandler);
		this.on("touchstart", this.touchHandler);
		this.on("touchmove", this.touchHandler);
		this.on("touchend", this.touchHandler);
	}
	
	_self.createGui = function() {
		var tfVersion = addText(version, 24, "#ffffff", "#000000", "right", 400, 4);
		tfVersion.x = _W - 30;
		tfVersion.y = _H - tfVersion.height - 10;
		_self.addChild(tfVersion);
		
		var logoDaoCasino = addObj("logoDaoCasino", 210, 1037);
		_self.addChild(logoDaoCasino);
		
		_btnStart = addButton("btnText", _W/2, 950);
		_btnStart.name = "btnStart"
		_btnStart.overSc = true;
		_self.addChild(_btnStart);
		_arButtons.push(_btnStart);
		var tfStart = addText(getText("start"), 50, "#FFFFFF", undefined, "center", 700);
		tfStart.x = 0;
		tfStart.y = -tfStart.height/2;
		_btnStart.addChild(tfStart);
		
		var btnDao = addButton("btnDao", 1836, 960);
		btnDao.overSc = true;
		_self.addChild(btnDao);
		_arButtons.push(btnDao);
		var btnFacebook = addButton("btnFacebook", 1870, 48);
		btnFacebook.overSc = true;
		_self.addChild(btnFacebook);
		_arButtons.push(btnFacebook);
		var btnTwitter = addButton("btnTwitter", 1870, 123);
		btnTwitter.overSc = true;
		_self.addChild(btnTwitter);
		_arButtons.push(btnTwitter);
	};
	
	// CLICK
	_self.clickStart = function() {
		_self.removeAllListener();
		addScreen("ScrGame");
	};
	
	_self.clickTwitter = function() {
		// @daocasino @ethereumproject @edcon #blockchain #ethereum
		if(twttr){
			var urlGame = 'http://platform.dao.casino/';
			var url="https://twitter.com/intent/tweet";
			var str='Play Treasure Island for BET '+ " " + urlGame;
			var hashtags="blockchain,ethereum,daocasino";
			var via="daocasino";
			window.open(url+"?text="+str+";hashtags="+hashtags+";via="+via,"","width=500,height=300");
		}
	}

	_self.clickFB = function() {
		if (typeof(FB) != 'undefined' && FB != null ) {
			var urlGame = 'http://platform.dao.casino/';
			var urlImg = "http://platform.dao.casino/games/blackjack/game/images/share/bgMenu.jpg";
			
			FB.ui({
			  method: 'feed',
			  picture: urlImg,
			  link: urlGame,
			  caption: 'PLAY',
			  description: 'Play Treasure Island for BET',
			}, function(response){});
		} else {
			console.log("FB is not defined");
		}
	}
	
	_self.clickCell = function(item_mc) {
		if(item_mc._disabled){
			return;
		}
		if(item_mc.overSc){
			item_mc.scale.x = 1*item_mc.sc;
			item_mc.scale.y = 1*item_mc.sc;
		}
		
		item_mc._selected = false;
		if(item_mc.name == "btnStart"){
			_self.clickStart();
		} else if(item_mc.name == "btnDao"){
			_self.removeAllListener();
			// var url = "https://platform.dao.casino/";
			var url = "/";
			window.open(url, "_self");
		} else if(item_mc.name == "btnFacebook"){
			_self.clickFB();
		} else if(item_mc.name == "btnTwitter"){
			_self.clickTwitter();
		}
	};
	
	_self.checkButtons = function(evt){
		var mouseX = evt.data.global.x;
		var mouseY = evt.data.global.y;
		
		for (var i = 0; i < _arButtons.length; i++) {
			var item_mc = _arButtons[i];
			if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)){
				if(item_mc._selected == false){
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
	};

	_self.touchHandler = function(evt){
		var phase = evt.type;
		
		if(phase=="mousemove" || phase == "touchmove" || phase == "touchstart"){
			this.checkButtons(evt);
		} else if (phase == "mousedown" || phase == "touchend") {
			for (var i = 0; i < _arButtons.length; i++) {
				var item_mc = _arButtons[i];
				if(item_mc._selected){
					this.clickCell(item_mc);
					i--;
					return;
				}
			}
		}
	};
	
	// UPDATE
	_self.update = function(diffTime) {
		if(options_pause){
			return;
		}
	};
	
	// REMOVE
	_self.removeAllListener = function() {
		clearClips();
		this.off("mouseup", this.touchHandler);
		this.off("mousedown", this.touchHandler);
		this.off("mousemove", this.touchHandler);
		this.off("touchstart", this.touchHandler);
		this.off("touchmove", this.touchHandler);
		this.off("touchend", this.touchHandler);
	};
	
	_self.init();
	
	return _self;
};

ScrMenu.prototype = Object.create(PIXI.Container.prototype);
ScrMenu.prototype.constructor = ScrMenu;