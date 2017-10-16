/**
 * Created by DAO.casino
 * Treasure Of DAO - Logic
 * v 1.0.0
 */

/*eslint no-undef: "none"*/

var GameLogic = function(params){
	var _self = this;
	
	var _prnt;
	var _callback;
	var _address   = "0x";
	var _balance   = 0;
	var _nonce = 0;
	var _debug = true;
	
	if(params){
		if(params.prnt){
			_prnt = params.prnt;
		}
		if(params.address){
			_address = params.address;
		}
		if(params.callback){
			_callback = params.callback;
		}
		_balance = params.balance || 0;
	}
	
	var _objGame = {
		method       : "",
		result       : false,
		play         : false,
		win          : false,
		countWinStr  : 0,
		valueBankroller : 0,
		valuePlayer : 0,
		countBox : 3,
		profitGame   : 0,
		betGame      : 0
	};
		
	var _arWinSt = [0, 2, 4, 10, 20, 50];
	
	_self.setBet = function(_bet){
		_nonce ++;
		_objGame = {method:"setBet",
					result:false, 
					play:true, 
					win:false, 
					countWinStr:0,
					valueBankroller:0, 
					valuePlayer:0, 
					countBox : 3,
					profitGame : 0,
					betGame:_bet};
					
		_balance -= _bet;
		
		return {
			bet : _bet
		}
	};
	
	_self.clickBox = function(_s, valPlayer){
		_nonce ++;
		_objGame.method = "clickBox";
		_objGame.valueBankroller = createRnd(_s, _objGame.countBox);
		_objGame.valuePlayer = valPlayer;
		_objGame.win = false;
		
		if(_objGame.valuePlayer == _objGame.valueBankroller){
			_objGame.countWinStr ++;
			_objGame.win = true;
			if(_objGame.countWinStr >= _arWinSt.length-1){
				_objGame.result = true;
			}
		} else {
			_objGame.countWinStr = 0;
			_objGame.result = true;
		}
		_objGame.profitGame = _objGame.betGame * _arWinSt[_objGame.countWinStr];
		
		// game over
		if(_objGame.result){
			_self.closeGame();
		}

		return {
			random_hash : _s,
			objGame 	: _objGame,
			balance     : _balance,
			timestamp   : new Date().getTime(),
		}
	};
	
	_self.closeGame = function(){
		_nonce ++;
		_objGame.method = "closeGame";
		_objGame.result = true;
		_objGame.play = false;
		if(_objGame.countWinStr > 0){
			_balance += _objGame.profitGame;
		}
		
		return {
			objGame 	: _objGame,
			balance     : _balance,
			timestamp   : new Date().getTime(),
		}
	}
	
	function createRnd(seed, val){
		var rand = Math.ceil(Math.random()*val);
		if(!_debug){
			var hash = Casino.ABI.soliditySHA3(["bytes32"],[ seed ]);		
			rand = Casino.bigInt(hash.toString("hex"),16).divmod(val).remainder.value + 1;
		}
		
		// console.log("GameLogic: rand=", rand);
		return rand;
	}
	
	_self.getGame = function(){
		return _objGame;
	};
	
	_self.balance = function(){
		return _balance
	};
	
	_self.nonce = function(){
		return _nonce
	};
	
	return _self;
};