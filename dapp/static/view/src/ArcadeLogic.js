
var ArcadeLogic = function(balance){
	var _self = this;
	
	const MIN_VALUE = 1;
	const MAX_VALUE = 3;
	
	var _balance = balance;
	var _session = 0;
	var _addressBankroll = "";
	var _addressPlayer = "";
	var _history = [];
	
	var _objGame = {
		method       : "",
		result       : false,
		play         : false,
		win          : false,
		valueBankroller : 0,
		valuePlayer  : 0,
		countBox     : 3,
		bufferProfit : 0,
		betGame      : 0
	};
	
	_self.clickBox = function(session, gameData){
		var betGame = Number(DCLib.Utils.dec2bet(gameData.value[0]));
		var valPlayer = gameData.value[1];
		
		// new game
		var objHistory = {balance:0, profit:0, countWinStr:0};
		_session ++;
		_balance -= betGame;
		_objGame.betGame = betGame;
		_objGame.countWinStr = 0;
		_objGame.bufferProfit = 0;
		_objGame.result = false;
		_objGame.play = false;
		_history.push(objHistory);
		
		_objGame.method = "clickBox";
		_objGame.valueBankroller = Math.ceil(Math.random()*_objGame.countBox);
		_objGame.valuePlayer = valPlayer;
		_objGame.result = true;
		
		if(_objGame.valuePlayer == _objGame.valueBankroller){
			_objGame.win = true;
		} else {
			_objGame.win = false;
		}
		
		_objGame.bufferProfit = _objGame.betGame;
		
		for(var tag in _objGame){
			objHistory[tag] = _objGame[tag];
		}
		
		// game over
		if (_objGame.win){
			_self.closeGame();
		}
		
		objHistory.balance = _balance;
		objHistory.profit =_objGame.bufferProfit - _objGame.betGame;
		
		return {
			objGame: _objGame,
			balance: _balance,
			history: _history,
			timestamp: new Date().getTime()
		};
	}
	
	_self.closeGame = function(){
		_objGame.method = "closeGame";
		_objGame.result = true;
		_objGame.play = false;
		
		_balance += _objGame.bufferProfit;
		var objHistory = _history[_session-1];
		objHistory.balance = _balance;
		objHistory.profit =_objGame.bufferProfit - _objGame.betGame;
		_history[_session-1] = objHistory;
		_objGame.betGame = 0;
		
		return {
			objGame 	: _objGame,
			history		: _history,
			balance     : _balance,
			timestamp   : new Date().getTime()
		};
	}
	
	_self.getGame = function(){
		return _objGame;
	}
	
	_self.getBalance = function(){
		return _balance;
	}
	
	_self.getHistory = function(){
		return _history;
	}
	
	_self.session = function(){
		return _session;
	}
	
	_self.loadGame = function(objGame, hist, session){
		_objGame = objGame;
		_history = hist;
		_session = session;
	}
	
	return _self;
}
