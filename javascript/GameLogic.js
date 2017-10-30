/**
 * Created by DAO.casino
 * Treasure Of DAO - Logic
 * v 1.0.0
 */

/*eslint no-undef: "none"*/

var GameLogic = function(){
	var _self = this;
	
	var _balance   = 0;
	var _nonce = 0;
	
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
	
	_self.setBalance = function(balance){
		_balance = balance;
		return {
			balance : balance
		}
	}
	
	_self.setBet = function(bet){
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
					betGame:bet};
					
		_balance -= bet;
		
		return {
			balance : _balance,
			bet : bet
		}
	}
	
	_self.clickBox = function(random_hash, valPlayer){
		_nonce ++;
		_objGame.method = "clickBox";
		// _objGame.valueBankroller = DCLib.randomNum(random_hash, 1, _objGame.countBox)
		_objGame.valueBankroller = 1; // REMOVE!!!
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
			random_hash : random_hash,
			objGame 	: _objGame,
			balance     : _balance,
			timestamp   : new Date().getTime(),
		}
	}
	
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
}
