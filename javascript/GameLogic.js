/**
 * Created by DAO.casino
 * Treasure Of DAO - Logic
 * v 1.0.0
 */

/*eslint no-undef: "none"*/

var GameLogic = function(){
	var _self = this;
	
	const MIN_VALUE = 1;
	const MAX_VALUE = 3;
	
	var _balance = 0;
	var _nonce = 0;
	var _openkey = DCLib.Account.get().openkey;
	var _addressBankroll = "";
	var _addressPlayer = "";
	
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
	
	_self.setGame = function(addressPlayer, addressBankroll, balance){
		_addressPlayer = addressPlayer;
		_addressBankroll = addressBankroll;
		_balance = balance;
		
		return true;
	}
	
	_self.clickBox = function(idChannel, nonce, round, seed, gameData, sign){
		var betGame = gameData.value[0];
		var valPlayer = gameData.value[1];
		var countWinStr = gameData.value[2];
		
		if(countWinStr >= _arWinSt.length || 
		countWinStr < 0 ||
		valPlayer < MIN_VALUE ||
		valPlayer > MAX_VALUE){
			return {
				error : "invalid_data"
			}
		}
		
		var randomHash = DCLib.web3.utils.soliditySha3(idChannel, nonce, round, seed, gameData);
		
		console.log("checkSig:", DCLib.checkSig(randomHash, sign.signature, _addressPlayer));
		if(!DCLib.checkSig(randomHash, sign.signature, _addressPlayer)){
			return {
				error : "invalid_hash"
			}
		}
		
		// new game
		if(betGame > 0){
			_balance -= betGame;
			_objGame.betGame = betGame;
			_objGame.countWinStr = 0;
			_objGame.profitGame = 0;
			_objGame.result = false;
			_objGame.play = false;
		}
		
		_objGame.method = "clickBox";
		_objGame.valueBankroller = DCLib.numFromHash(randomHash, 1, _objGame.countBox);
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
		
		var signB = signBankroll(randomHash);
		
		return {
			randomHash  : randomHash,
			objGame 	: _objGame,
			balance     : _balance,
			signB 		: signB,
			timestamp   : new Date().getTime()
		}
	}
	
	_self.closeGame = function(){
		var countWinStr = _objGame.countWinStr;
		_nonce ++;
		_objGame.method = "closeGame";
		_objGame.result = true;
		_objGame.play = false;
		if(countWinStr > 0){
			_balance += _objGame.profitGame;
		}
		_objGame.countWinStr = 0;
		
		return {
			objGame 	: _objGame,
			countWinStr : countWinStr,
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

function signBankroll(){
	return undefined;
}