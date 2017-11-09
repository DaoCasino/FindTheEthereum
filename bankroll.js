/**
 * Created by DAO.casino
 * Find The Ethereum
 * v 1.0.0
 */
 
window.FTEdebug = (function(){
	var startTime = getTimer();
	var timeUsersList = 0;
	var listUsers = [];
	
	// GAME LOGIC
	var FTELogic = function(){
		var _self = this;
		
		const MIN_VALUE = 1;
		const MAX_VALUE = 3;
		
		var _balance = 0;
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
			valuePlayer : 0,
			countBox : 3,
			profitGame   : 0,
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
		_self.initGame = function(addressPlayer, addressBankroll, balance){
			_addressPlayer = addressPlayer;
			_addressBankroll = addressBankroll;
			_balance = balance;
			
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
			return _balance
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
	}
	function getTimer(){
		var d = new Date();
		var n = d.getTime();
		return n;
	}
	
	function update(){
		requestAnimationFrame(update);
		
		var diffTime = getTimer() - startTime;
		if(diffTime > 29){
			timeUsersList += diffTime;
			
			// update list users
			if(timeUsersList > 1000){
				timeUsersList = 0;
				for (const prop in FindTheEthereum.users) {
					// add listener
					if(listUsers.indexOf(prop) == -1){
						listUsers.push(prop);
						var room = FindTheEthereum.users[prop].room;
						room.on('all', 
							function(data){
								if(data.action=='signBankroll'){
									FindTheEthereum.response(data,{
										sig: DCLib.Account.sign(data.rawMsg)
									},room)
								}
							}
						)
					}
				}
			}
			
			startTime = getTimer();
		}
	}
	// update();
	
	const FindTheEthereum = new DCLib.DApp({
		code  : 'DC_FindTheEthereum',
		logic : FTELogic,
	})
	
	return FindTheEthereum

})();
