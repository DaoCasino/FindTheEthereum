 /**
 * Created by DAO.casino.
 * v 1.0.0
 *
 * @constructor
 * @this {GameLogic}
 *  
 * Define our DApp logic constructor, 
 * for use it in frontend and bankroller side
 */

DCLib.defineDAppLogic('DC_FindTheEthereum', function(){
	var _self = this;
	
	const MIN_VALUE = 1;
	const MAX_VALUE = 3;
	
	var _session = 0;
	var _addressBankroll = "";
	var _addressPlayer = "";
	
	var _objGame = {
		method       : "",
		result       : false,
		play         : false,
		win          : false,
		countWinStr  : 0,
		valueBankroller : 0,
		valuePlayer  : 0,
		countBox     : 3,
		bufferProfit : 0,
		betGame      : 0
	};
		
	var _arWinSt = [0, 2, 4, 10, 20, 50];
	
	/**
	 * Set the game parameters.
	 *
	 * @param  {string} addressPlayer Player address.
	 * @param  {string} addressBankroll Bankroll address.
	 * @param  {number} balance Player tokens balance.
	 * @return {boolean} true.
	 */
	_self.initGame = function(addressPlayer, addressBankroll){
		_addressPlayer = addressPlayer;
		_addressBankroll = addressBankroll;
		
		return true;
	}
	
	/**
	 * Data signing by bankroll.
	 *
	 * @param  {string} idChannel Unique channel id.
	 * @param  {number} session Game session number.
	 * @param  {number} round Round in the gaming session.
	 * @param  {string} seed Unique player seed.
	 * @param  {Object} gameData The object contains data from the player.
	 * @param  {string} gameData.type Data type in an array.
	 * @param  {number[]} gameData.value Array of player values.
	 * @param  {string} signPlayer Player's signature of previous parameters.
	 * @return {Object} signBankroll Returns the signature of the bankroll.
	 */
	_self.signBankroll = function(idChannel, session, round, seed, gameData, signPlayer){
		var randomHash = DCLib.web3.utils.soliditySha3(idChannel, session, round, seed, gameData);
		var signBankroll = DCLib.Account.signHash(randomHash);
		
		if(!DCLib.checkHashSig(randomHash, signPlayer, _addressPlayer)){
			return {
				error: "invalid_signature_player"
			}
		}
		
		return {
			randomHash: randomHash,
			signBankroll: signBankroll
		}
	}
	
	/**
	 * Box selection. The result of the game is calculated. Parameters change.
	 *
	 * @param  {string} idChannel Unique channel id.
	 * @param  {number} session Game session number.
	 * @param  {number} round Round in the gaming session.
	 * @param  {string} seed Unique player seed.
	 * @param  {Object} gameData The object contains data from the player.
	 * @param  {string} gameData.type Data type in an array.
	 * @param  {number[]} gameData.value Array of player values.
	 * @param  {string} signBankroll Bankroll's signature of previous parameters.
	 * @return {Object} objGame Returns the changed game object.
	 */
	_self.clickBox = function(idChannel, session, round, seed, gameData, signBankroll){
		var betGame = gameData.value[0];
		var valPlayer = gameData.value[1];
		var countWinStr = gameData.value[2];
		var randomHash = DCLib.web3.utils.soliditySha3(idChannel, session, round, seed, gameData);
		
		if(!DCLib.checkHashSig(randomHash, signBankroll, _addressBankroll)){
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
			_self.payChannel.addTX(-betGame);
			_objGame.betGame = betGame;
			_objGame.countWinStr = 0;
			_objGame.bufferProfit = 0;
			_objGame.result = false;
			_objGame.play = false;
		}
		
		_objGame.method = "clickBox";
		_objGame.valueBankroller = DCLib.numFromHash(signBankroll, 1, _objGame.countBox);
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
		
		_objGame.bufferProfit = _objGame.betGame * _arWinSt[_objGame.countWinStr];
		
		// game over
		if(_objGame.result){
			_self.closeGame();
		}
		
		return {
			objGame 	: _objGame,
			balance     : _self.payChannel.getBalance(),
			signBankroll 		: signBankroll,
			timestamp   : new Date().getTime()
		}
	}
	
	/**
	 * Closes the game session.
	 *
	 * @return {Object} objGame Returns the changed game object.
	 */
	_self.closeGame = function(){
		var countWinStr = _objGame.countWinStr;
		_session ++;
		_objGame.method = "closeGame";
		_objGame.result = true;
		_objGame.play = false;
		
		_objGame.countWinStr = 0;
		_self.payChannel.addTX(_objGame.bufferProfit);
		
		return {
			objGame 	: _objGame,
			countWinStr : countWinStr,
			balance     : _self.payChannel.getBalance(),
			timestamp   : new Date().getTime(),
		}
	}
	
	/**
	 * Returns a game object.
	 *
	 * @return {Object} objGame Returns a game object.
	 */
	_self.getGame = function(){
		return _objGame;
	}
	
	/**
	 * Returns the player's balance.
	 *
	 * @return {number} Returns the player's balance.
	 */
	_self.getBalance = function(){
		return _self.payChannel.getBalance()
	}
	
	/**
	 * Returns the session number of the game.
	 *
	 * @return {number} Returns the session number of the game.
	 */
	_self.session = function(){
		return _session
	}
	
	return _self;
})
