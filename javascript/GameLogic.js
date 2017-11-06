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
	var _session = 0;
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
	
	_self.signBankroll = function(idChannel, session, round, seed, gameData, signPlayer){
		var randomHash = DCLib.web3.utils.soliditySha3(idChannel, session, round, seed, gameData);
		var addressSign = DCLib.sigRecover(randomHash, signPlayer.signature);
		
		if(addressSign.toLowerCase() != _addressPlayer.toLowerCase()){
		// if(!DCLib.checkSig(randomHash, signPlayer.signature, _addressPlayer)){
			return {
				error: "invalid_signature_player"
			}
		}
		
		return {
			randomHash: randomHash,
			signBankroll: DCLib.Account.sign(randomHash)
		}
	}
	
	_self.clickBox = function(idChannel, session, round, seed, gameData, signBankroll){
		var betGame = gameData.value[0];
		var valPlayer = gameData.value[1];
		var countWinStr = gameData.value[2];
		var randomHash = DCLib.web3.utils.soliditySha3(idChannel, session, round, seed, gameData);
		var addressSign = DCLib.sigRecover(randomHash, signBankroll.signature);
		
		if(addressSign.toLowerCase() != _addressBankroll.toLowerCase()){
		// if(!DCLib.checkSig(randomHash, signBankroll.signature, _addressBankroll)){
			return {
				error: "invalid_signature_bankroll"
			}
		}
		
		if(countWinStr >= _arWinSt.length || 
		countWinStr < 0 ||
		valPlayer < MIN_VALUE ||
		valPlayer > MAX_VALUE){
			return {
				error : "invalid_data"
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
		_objGame.valueBankroller = DCLib.numFromHash(signBankroll.signature, 1, _objGame.countBox);
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
			objGame 	: _objGame,
			balance     : _balance,
			signB 		: signBankroll,
			timestamp   : new Date().getTime()
		}
	}
	
	_self.closeGame = function(){
		var countWinStr = _objGame.countWinStr;
		_session ++;
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
	
	_self.session = function(){
		return _session
	};
	
	return _self;
}
