/**
 * Created by DAO.casino
 * Treasure Of DAO - Game
 * v 1.0.0
 */

/*eslint no-undef: "none"*/

var ScrGame = function(){
	PIXI.Container.call( this );
	
	var _self = this;
	var _logic, _objGame, _objTutor;
	var _curWindow, _itemBet, _bgDark, _itemTutorial;
	var _tfBalance, _tfBet, _tfWinStr;
	var _fRequestFullScreen, _fCancelFullScreen;
	// layers
	var back_mc, game_mc, face_mc, wnd_mc, warning_mc, tutor_mc;
	// buttons
	var _btnStart, _btnClose, _btnStart, _pirateContinue, _pirateSave;
	// windows
	var _wndDeposit, _wndBet, _wndWarning, _wndInfo, _wndWS, _wndWin;
	// boolean
	var _gameOver, _bWindow;
	// numbers
	var _measure, _idTutor,
	_betGame, _balanceBet, _balanceSession, _balanceGame,
	_timeCloseWnd;
	// arrays
	var _arButtons, _arBoxes;
	// strings
	var _openkey;
	
	// INIT
	_self.init = function(){
		var bg = addObj("bgGame", _W/2, _H/2);
		scaleBack = _W/bg.w;
		bg.scale.x = scaleBack;
		bg.scale.y = scaleBack;
		_self.addChild(bg);
		var tableLogo = addObj("tableLogo");
		tableLogo.scale.x = scaleBack;
		tableLogo.scale.y = scaleBack;
		tableLogo.x = 952*scaleBack;
		tableLogo.y = 546*scaleBack;
		_self.addChild(tableLogo);
		
		_self.createLayers();
		_self.createBooleans();
		_self.createNumbers();
		_self.createArrays();
		_self.createStrings();
		_self.createGui();
		_self.createBtn();
		_self.showWndDeposit();
		_self.showTutorial(1);
		
		this.interactive = true;
		this.on("mouseup", this.touchHandler);
		this.on("mousedown", this.touchHandler);
		this.on("mousemove", this.touchHandler);
		this.on("touchstart", this.touchHandler);
		this.on("touchmove", this.touchHandler);
		this.on("touchend", this.touchHandler);
	};
	
	// CREATE
	_self.createLayers = function(){
		back_mc = new PIXI.Container();
		game_mc = new PIXI.Container();
		face_mc = new PIXI.Container();
		warning_mc = new PIXI.Container();
		wnd_mc = new PIXI.Container();
		tutor_mc = new PIXI.Container();
		
		_self.addChild(game_mc);
		_self.addChild(back_mc);
		_self.addChild(face_mc);
		_self.addChild(warning_mc);
		_self.addChild(wnd_mc);
		_self.addChild(tutor_mc);
	}
	
	_self.createBooleans = function(){
		_gameOver = false;
		_bWindow = false;
	}
	
	_self.createNumbers = function(){
		_measure = 100000000;
		_idTutor = 0;
		_betGame = 1;
		_balanceBet = 0;
		_balanceSession = 0;
		_timeCloseWnd = 0;
	}
	
	_self.createArrays = function(){
		_arButtons = [];
		_arBoxes = [];
	}
	
	_self.createStrings = function(){
		if(options_dc){
			_openkey = Casino.Account.get().openkey;
		}
		if(options_debug){
			_openkey = "0x";
		}
	}
	
	_self.createGui = function() {
		var sizeTf = 40;
		var posY = 48;
		var offsetY = 84;
		
		_bgDark = new PIXI.Graphics();
		_bgDark.beginFill(0x000000).drawRect(0, 0, _W, _H).endFill();
		_bgDark.alpha = 0.5;
		_bgDark.visible = false;
		back_mc.addChild(_bgDark);
		
		var icoKey = addObj("icoKey", 52, posY);
		face_mc.addChild(icoKey);
		var icoBet = addObj("icoBet", 52, posY+offsetY*1);
		face_mc.addChild(icoBet);
		var icoWS = addObj("icoWS", 52, posY+offsetY*2);
		face_mc.addChild(icoWS);
		var tfAddress= addText("0x", sizeTf, "#ffffff", "#000000", "left", 600, 4);
		tfAddress.x = icoKey.x + icoKey.w/2 + 10;
		tfAddress.y = icoKey.y - tfAddress.height/2;
		face_mc.addChild(tfAddress);
		_tfBalance = addText("0  BET", sizeTf, "#ffffff", "#000000", "left", 400, 4);
		_tfBalance.x = tfAddress.x;
		_tfBalance.y = icoBet.y - _tfBalance.height/2;
		face_mc.addChild(_tfBalance);
		_tfWinStr= addText("0", sizeTf, "#ffffff", "#000000", "left", 400, 4);
		_tfWinStr.x = tfAddress.x;
		_tfWinStr.y =  icoWS.y - _tfWinStr.height/2;
		face_mc.addChild(_tfWinStr);
		var tfVersion = addText(version, 24, "#ffffff", "#000000", "right", 400, 4);
		tfVersion.x = _W - 30;
		tfVersion.y = _H - tfVersion.height - 10;
		face_mc.addChild(tfVersion);
		
		_wndWS = new ItemWS();
		_wndWS.x = 190;
		_wndWS.y = 750;
		face_mc.addChild(_wndWS);
		
		_itemBet = new PIXI.Container();
		_itemBet.x = _W/2;
		_itemBet.y = 878;
		back_mc.addChild(_itemBet);
		var bgBet = addObj("bgBet");
		_itemBet.addChild(bgBet);
		var itemBet = addObj("itemBet", -120);
		_itemBet.addChild(itemBet);
		_tfBet = addText("", 60, "#ED9829", "#000000", "left", 400);
		_tfBet.x = -50;
		_tfBet.y = -_tfBet.height/2 - 5;
		_itemBet.addChild(_tfBet);
		_itemBet.visible = false;
	}
	
	_self.createBtn = function(){
		var doc = window.document;
		var docEl = doc.documentElement;
		_fRequestFullScreen = docEl.requestFullscreen || 
									docEl.mozRequestFullScreen || 
									docEl.webkitRequestFullScreen || 
									docEl.msRequestFullscreen;
		_fCancelFullScreen = doc.exitFullscreen || 
									doc.mozCancelFullScreen || 
									doc.webkitExitFullscreen || 
									doc.msExitFullscreen;
									
		_btnStart = addButton("btnText", _W/2, 878);
		_btnStart.overSc = true;
		_btnStart.name = "btnStart";
		_btnStart.visible = false;
		face_mc.addChild(_btnStart);
		_arButtons.push(_btnStart);
		var tfStart = addText(getText("new_game"), 34, "#FFFFFF", undefined, "center", 240);
		tfStart.x = 0;
		tfStart.y = -tfStart.height/2;
		_btnStart.addChild(tfStart);
		
		_pirateSave = addButton("btnText", _W/2 - 250, 450,);
		_pirateSave.name = "pirateSave";
		_pirateSave.visible = false;
		_pirateSave.overSc = true;
		var tfBtnSave = addText(getText("save"), 40, "#FFFFFF", undefined, "center", 300);
		tfBtnSave.x = 0;
		tfBtnSave.y = -tfBtnSave.height/2;
		_pirateSave.addChild(tfBtnSave);
		face_mc.addChild(_pirateSave);
		_arButtons.push(_pirateSave);
		
		_pirateContinue = addButton("btnText", _W/2 + 250, 450);
		_pirateContinue.name = "pirateContinue";
		_pirateContinue.overSc = true;
		_pirateContinue.visible = false;
		var tfBtnContinue = addText(getText("continue"), 40, "#FFFFFF", undefined, "center", 300);
		tfBtnContinue.x = 0;
		tfBtnContinue.y = -tfBtnContinue.height/2;
		_pirateContinue.addChild(tfBtnContinue);
		face_mc.addChild(_pirateContinue);
		_arButtons.push(_pirateContinue);
		
		var posX = 1840;
		var posY = 960;
		var offsetY = 135;
		var btnDao = addButton("btnDao", posX-4, posY - 0*offsetY);
		btnDao.overSc = true;
		face_mc.addChild(btnDao);
		_arButtons.push(btnDao);
		var btnFullscreen = addButton("btnFullscreen", posX, posY - 1*offsetY);
		btnFullscreen.overSc = true;
		face_mc.addChild(btnFullscreen);
		_arButtons.push(btnFullscreen);
		var btnContract = addButton("btnContract", posX, posY - 2*offsetY);
		btnContract.overSc = true;
		face_mc.addChild(btnContract);
		_arButtons.push(btnContract);
		var btnCashout = addButton("btnCashout", posX, posY - 3*offsetY);
		btnCashout.overSc = true;
		face_mc.addChild(btnCashout);
		_arButtons.push(btnCashout);
		var btnFacebook = addButton("btnFacebook", 1870, 48);
		btnFacebook.overSc = true;
		face_mc.addChild(btnFacebook);
		_arButtons.push(btnFacebook);
		var btnTwitter = addButton("btnTwitter", 1870, 123);
		btnTwitter.overSc = true;
		face_mc.addChild(btnTwitter);
		_arButtons.push(btnTwitter);
	}
	
	_self.createTreasure = function() {		
		if(_objGame == undefined){
			return;
		}
		var w = 1300;
		var offset = w/_objGame.countBox;
		var arPosY = [400, 250, 400];
		var arName = ["L", "", "R"];
		
		for (var i = 0; i < _objGame.countBox; i++) {
			var box = new ItemBox(_self, arName[i]);
			box.x = _W/2 - w/2 + offset*i + offset/2;
			box.y = arPosY[i];
			box.id = (i+1);
			game_mc.addChild(box);
			_arButtons.push(box);
			_arBoxes.push(box);
		}
	};
	
	_self.createWndInfo = function(str, callback, addStr) {
		if(_bWindow){
			return false;
		}
		if(_wndInfo == undefined){
			_wndInfo = new WndInfo(this);
			_wndInfo.x = _W/2;
			_wndInfo.y = _H/2;
			wnd_mc.addChild(_wndInfo);
		}
		
		_bWindow = true;
		
		_wndInfo.show(str, callback, addStr)
		_wndInfo.visible = true;
		_curWindow = _wndInfo;
	}
	
	// REFRESH
	_self.refreshBalance = function() {		
		_tfBalance.setText((_balanceSession/_measure).toFixed(2) + " BET");
	};
	
	// CLOSE
	_self.closeWindow = function(wnd) {
		_curWindow = wnd;
		if(options_debug){
			_curWindow.visible = false;
			_curWindow = undefined;
			_bWindow = false;
		} else {
			_timeCloseWnd = 100;
		}
	}
	
	// SHOW
	_self.showWndDeposit = function() {
		if(_bWindow){
			return;
		}
		// if(_balancePlEth < 0.01){
			// _self.showError(ERROR_BALANCE);
			// infura.sendRequest("getBalance", openkey, _callback);
			// _self.showChips(true);
			// return;
		// }
		if(_wndDeposit == undefined){
			_wndDeposit = new WndDeposit(_self);
			_wndDeposit.x = _W/2;
			_wndDeposit.y = _H/2;
			wnd_mc.addChild(_wndDeposit);
		}
		
		if(options_dc){
			Casino.Account.getBetsBalance(_self.getBetsBalance);
		}
		if(options_debug){
			_balanceBet = 10;
		}
		_bWindow = true;
		var str = getText("set_deposit").replace(new RegExp("SPL"), "\n");
		_wndDeposit.show(str, function(value){
					_balanceSession = value*_measure;
					_self.refreshBalance();
					_self.startChannelGame();
				}, _balanceBet)
		_timeCloseWnd = 0;
		_wndDeposit.visible = true;
		_curWindow = _wndDeposit;
	}
	
	_self.showWndBet = function() {
		if(_bWindow){
			return;
		}
		if(_wndBet == undefined){
			_wndBet = new WndDeposit(_self);
			_wndBet.x = _W/2;
			_wndBet.y = _H/2;
			wnd_mc.addChild(_wndBet);
		}
		
		if(_idTutor == 1){
			_self.showTutorial(2);
		}
		
		_bWindow = true;
		var str = getText("set_bet").replace(new RegExp("SPL"), "\n");
		_wndBet.show(str, function(value){
					_self.setBet(value);
				}, _balanceSession/_measure)
		_timeCloseWnd = 0;
		_wndBet.visible = true;
		_curWindow = _wndBet;
	}
	
	_self.showWndWin = function() {
		if(_bWindow){
			return;
		}
		if(_wndWin == undefined){
			_wndWin = new WndWin(_self);
			_wndWin.x = _W/2;
			_wndWin.y = _H/2;
			wnd_mc.addChild(_wndWin);
		}
		var str = getText("win") + "!";
		if(_objGame){
			// str = "+" + (_objGame.profitGame-_betGame)/_measure;
			str = "+" + (_objGame.profitGame)/_measure;
		}
		
		_itemTutorial.visible = false;
		_bWindow = true;
		_wndWin.show(str, _self.closeGame)
		_timeCloseWnd = 0;
		_wndWin.visible = true;
		_curWindow = _wndWin;
	}
	
	_self.showTutorial = function(id) {		
		if(_itemTutorial == undefined){
			_objTutor = {};
			_itemTutorial = new ItemTutorial(_self);
			_itemTutorial.x = _W/2;
			_itemTutorial.y = _H/2;
			tutor_mc.addChild(_itemTutorial);
		}
		
		_idTutor = id;
		if(_objTutor[id] && id != 5){
			return;
		}
		_objTutor[id] = true;
		
		switch(id){
			default:
				_itemTutorial.x = 1450;
				_itemTutorial.y = 850;
				break;
		}
		
		_itemTutorial.show(getText("tutor_"+id));
		_itemTutorial.visible = true;
	}
	
	_self.showWndWarning = function(str) {
		if(_wndWarning == undefined){
			_wndWarning = new PIXI.Container();
			_wndWarning.x = _W/2;
			_wndWarning.y = _H/2;
			warning_mc.addChild(_wndWarning);
			
			var bg = addObj("bgWndWarning");
			_wndWarning.addChild(bg);
			var tfTitle = addText(getText("please_wait"), 40, "#FFCC00", "#000000", "center", 500, 3)
			tfTitle.y = - 90;
			_wndWarning.addChild(tfTitle);
			var tf = addText("", 26, "#FFFFFF", "#000000", "center", 500, 3)
			tf.y = - 30;
			_wndWarning.addChild(tf);
			
			var loading = new ItemLoading();
			loading.x = 0;
			loading.y = 60;
			_wndWarning.addChild(loading);
			
			_wndWarning.tf = tf;
			_wndWarning.loading = loading;
		}
		
		_wndWarning.tf.setText(str);
		_wndWarning.tf.y = -_wndWarning.tf.height/2;
		_wndWarning.visible = true;
	}
	
	_self.showError = function(value, callback) {
		var str = "ERROR! \n\n " + value //+ " \n\n " + getText("contact_support");
		
		if(_wndWarning){
			_wndWarning.visible = false;
		}
		
		_self.createWndInfo(str, 
            function() {
                if (callback) {
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            }
		);
	}

	// CHANNEL
	_self.startChannelGame = function(){
		var str = getText("open_channel_start").replace(new RegExp("SPL"), "\n");
		_self.showWndWarning(str);
		
		if(_idTutor == 1){
			_itemTutorial.visible = false;
		}
		
		if(options_debug){
			_wndWarning.visible = false;
			_self.initLogic(_balanceSession);
			_self.createTreasure();
			_self.showWndBet();
			return false;
		}
		
		// TODO
	}
	
	_self.closeGameChannel = function(deposit){
		if(_logic){
			// TODO
		}
	}
	
	_self.initLogic = function(deposit){
		// init logic
		var params = { prnt:_self, 
			balance:  deposit, 
			address:  _openkey,
			callback: _self.responseServer
		};
		
		_logic = new GameLogic(params);
		_objGame = _logic.getGame();	
	}
	
	// DC
	_self.getBlock = function() {
		// var state = {
			// playerbalance: _logic.balance(),
			// bankrollbalance: 0,
			// nonce: _logic.nonce(),
			// seed: Casino.getChannelGameRandom(,
			// PlayergameData: _logic.getGame()
		// };
		
		// return {state:state, 
				// sig:Casino.ABI.soliditySHA3(["bytes32"],[state]};
	}
	
	_self.getBetsBalance = function(value) {
		_balanceBet = Number(value);
		_self.refreshBalance();
	}
	
	// ACTION
	_self.setBet = function(value) {
		_betGame = value*_measure;
		_balanceGame = _betGame;
		_balanceSession -= _betGame;
		_self.refreshBalance();
		_itemBet.visible = true;
		_pirateSave.visible = false;
		_pirateContinue.visible = false;
		_bgDark.visible = false;
		
		if(_idTutor == 2){
			_self.showTutorial(3);
		}
		
		if(options_debug){
			_tfBet.setText((_betGame/_measure).toFixed(2));
			_wndWS.setBet(_betGame/_measure);
			_logic.setBet(_betGame);
			return
		}
		
		if(options_dc){
			Casino.callChannelGameFunc(
				'setBet', [_betGame], 
				function(res){
					_tfBet.setText((res/_measure).toFixed(2));
					_logic.setBet(res);
				},  
				function(log){ console.info(log) }
			);
		}
	}
	
	_self.refreshBoxes = function() {
		for (var i = 0; i < _arBoxes.length; i++) {
			var box = _arBoxes[i];
			box.refresh();
		}
	}
	
	_self.newGame = function() {
		if(_balanceSession < 0.01*_measure){
			_self.showError(getText("error_balance_bet"));
		} else {
			if(_idTutor == 4){
				_itemTutorial.visible = false;
			}
			_self.refreshBoxes();
			_gameOver = false;
			_btnStart.visible = false;
			_self.showWndBet();
		}
	}
	
	_self.continueGame = function() {
		_gameOver = false;
		_pirateSave.visible = false;
		_pirateContinue.visible = false;
		_bgDark.visible = false;
		_itemTutorial.visible = false;
		_self.refreshBoxes();
	}
	
	_self.closeGame = function() {
		_gameOver = true;
		_pirateSave.visible = false;
		_pirateContinue.visible = false;
		_bgDark.visible = false;
		var result = {};
		
		if(options_debug){
			result = _logic.closeGame();
		} else if(options_dc){
			Casino.callChannelGameFunc(
				'closeGame', [], 
				function(res){
					result = _logic.closeGame();
				},  
				function(log){ console.info(log) }
			);
		}
		
		_objGame = result.objGame;
		_balanceSession = result.balance;
		_self.refreshBalance();
		_balanceGame = 0;
		_btnStart.visible = true;
		_itemBet.visible = false;
	}
	
	// CLICK
	_self.clickBox = function(box) {
		if(_gameOver){
			return;
		}
		_gameOver = true;
		var result = {};
		
		if(_idTutor == 3){
			_itemTutorial.visible = false;
		}
		
		if(options_debug){
			result = _logic.clickBox(makeID(), box.id);
			_self.showResult(result, box);
			return
		} 
		
		if(options_dc){
			Casino.callChannelGameFunc(
				"clickBox", [Casino.getChannelGameRandom(), box.id],
				function(res){
					result = _logic.clickBox(res.random_hash, box.id);
					_self.showResult(result, box);
				},
				function(log){ console.info(log) }
			);
		}
	}
	
	_self.fullscreen = function() {
		 if(options_fullscreen) { 
			_fCancelFullScreen.call(window.document);
			options_fullscreen = false;
		}else{
			_fRequestFullScreen.call(window.document.documentElement);
			options_fullscreen = true;
		}
	}
	
	_self.clickContract = function() {
		var url = urlEtherscan + "address/" + addressContract;
		window.open(url, "_blank"); 
	}
	
	_self.clickCashout = function() {
		
	}
	
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
		
		item_mc._selected = false;
		if(item_mc.over){
			item_mc.over.visible = false;
		}
		if(item_mc.overSc){
			item_mc.scale.x = 1*item_mc.sc;
			item_mc.scale.y = 1*item_mc.sc;
		}
		if(item_mc.name == "ItemBox"){
			_self.clickBox(item_mc);
		} else if(item_mc.name == "btnStart"){
			_self.newGame();
		} else if(item_mc.name == "pirateContinue"){
			_self.continueGame();
		} else if(item_mc.name == "pirateSave"){
			_self.showWndWin();
		} else if(item_mc.name == "btnFullscreen"){
			_self.fullscreen();
		} else if(item_mc.name == "btnContract"){
			_self.clickContract();
		} else if(item_mc.name == "btnCashout"){
			_self.clickCashout();
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
	}
	
	_self.checkButtons = function(evt){
		if(_bWindow){
			return;
		}
		var mouseX = evt.data.global.x;
		var mouseY = evt.data.global.y;
		
		for (var i = 0; i < _arButtons.length; i++) {
			var item_mc = _arButtons[i];
			if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)){
				if(item_mc._selected == false && !item_mc._disabled && item_mc.visible){
					item_mc._selected = true;
					if(item_mc.over){
						item_mc.over.visible = true;
						if(item_mc.name == "ItemBox"){
							item_mc.main.visible = false;
						}
					} else if(item_mc.overSc){
						item_mc.scale.x = 1.1*item_mc.sc;
						item_mc.scale.y = 1.1*item_mc.sc;
					}
					
					if(item_mc.name == "pirateSave" && _itemTutorial){
						_itemTutorial.show(getText("save_prize"));
					} else if(item_mc.name == "pirateContinue" && _itemTutorial){
						_itemTutorial.show(getText("continue_game"));
					}
				}
			} else {
				if(item_mc._selected){
					item_mc._selected = false;
					if(item_mc.over){
						item_mc.over.visible = false;
						if(item_mc.name == "ItemBox"){
							item_mc.main.visible = true;
						}
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
		
		if(phase=="mousedown" || phase=="mousemove" || phase == "touchmove" || phase == "touchstart"){
			this.checkButtons(evt);
		} else if (phase == "mouseup" || phase == "touchend") {
			for (var i = 0; i < _arButtons.length; i++) {
				var item_mc = _arButtons[i];
				if(item_mc._selected){
					this.clickCell(item_mc);
					return;
				}
			}
		}
	};
	
	// RESPONSE
	_self.responseServer = function(objGame){
		_objGame = objGame;
	};
	
	// UPDATE
	_self.update = function(diffTime) {		
		if(_timeCloseWnd > 0 && _curWindow && _bWindow){
			_timeCloseWnd -= diffTime;
			if(_timeCloseWnd < 100){
				_timeCloseWnd = 0;
				_curWindow.visible = false;
				_curWindow = undefined;
				_bWindow = false;
			}
		}
		
		if(_wndWarning){
			if(_wndWarning.visible){
				_wndWarning.loading.update(diffTime);
			}
		}
		
		if(_gameOver){
			return;
		}
	};

	// RESULT
	_self.showResult = function(result, box){
		_objGame = result.objGame;
		_balanceSession = result.balance;
		_self.refreshBalance();
		_balanceGame = _objGame.profitGame;
		_tfWinStr.setText(_objGame.countWinStr);
		
		box.setSelected(true);
		
		for (var i = 0; i < _arBoxes.length; i++) {
			var item_mc = _arBoxes[i];
			item_mc.setDisabled(true);
		}
		
		if(_objGame.win){
			box.openBox(true);
			_wndWS.refreshWS(_objGame.countWinStr);
		} else {
			box.openBox(false);
			_wndWS.clear();
		}
		_tfBet.setText((_balanceGame/_measure).toFixed(2));
		
		var it = new ItemResult(_objGame.win, box.x, box.y-200)
		face_mc.addChild(it)
		
		createjs.Tween.get({}).to({},1000)
				.call(function(){
					var ind = 0;
					for (var i = 0; i < _arBoxes.length; i++) {
						var item_mc = _arBoxes[i];
						if(item_mc.id == _objGame.valueBankroller){
							item_mc.openBox(true);
						} else {
							item_mc.openBox(false);
						}
					}
				});
				
		createjs.Tween.get({}).to({},2500)
				.call(function(){
					_self.fixResult();
				});
	};
	
	_self.fixResult = function(){
		if(_objGame.win){
			if(_objGame.countWinStr < 5){
				_bgDark.visible = true;
				_pirateSave.visible = true;
				_pirateContinue.visible = true;
				_self.showTutorial(5);
			} else {
				_self.showWndWin();
			}
		} else {
			// Game Over
			if(_objGame.result){
				_self.closeGame();
			}
			_self.showTutorial(4);
		}
	}

	_self.getGame = function(){
		if (!_logic || !_logic.getGame) { return false; }
		return _logic.getGame()
	}
	
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

ScrGame.prototype = Object.create(PIXI.Container.prototype);
ScrGame.prototype.constructor = ScrGame;
