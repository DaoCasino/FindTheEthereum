var ScrTest = function(){
	var _self = this;
	var _block;
	
	// INIT
	_self.init = function(){
		var gameData = {
						playerbalance: 1000,
						bankrollbalance: 100000,
						winStreak:0,
						bet:0,
						valueBankroller:0, 
						valuePlayer:0,
						result:false};
		
		_block = {
			addressPlayer: "0x1",
			addressBankroll: "0x2",
			nonce: 0,
			seed: "fdgjk546gnd823gn",
			playerGameData: gameData
		}
		
		// запускаем раунд 1
		_self.runRound();
	}
	
	_self.runRound = function() {
		var hash = Hash(_block);
		var sign = Sign(hash);
		
		var signBlock = {block:_block,
						mySign:sign,
						bankrollSign:false};
		
		// отправляем банкроллеру подписанный нами блок
		gameDataBankroll = _self.sendBlock(signBlock);
		signBlock = objResult.signBlock;
		var gameDataBankroll = objResult.gameDataBankroll; // результат банкроллера
		// отправляем подписанный блок обеими сторонами
		var gameDataPlayer = _self.runGame(signBlock); // результат игрока
		// сверяем результат обеих сторон
		var result = _self.checkResult(gameDataBankroll, gameDataPlayer);
		if(result){
			// играем дальше
			_self.updateGame(gameDataPlayer);
		} else {
			// открываем диспут
		}
	}
	
	_self.updateGame = function(gameData) {
		_self.updateBlock(gameData);
		kellas.updateChannel(); // подписывает новое состояние канала и отправляет банкроллу
		_self.runRound();
	}
	
	_self.updateBlock = function(gameData) {
		_block.playerGameData = gameData;
		_block.nonce ++;
		_block.seed = kellas.rndSeed();
	}
	
	_self.sendBlock = function(signBlock) {
		signBlock.bankrollSign = Sign(signBlock.mySign);
		var gameDataBankroll = _self.runGame(signBlock);
		return {signBlock, gameDataBankroll};
	}
	
	// GameLogic
	_self.runGame = function(signBlock) {
		var gameData = signBlock.block.playerGameData;
		gameData.valueBankroller = kellas.getRnd(signBlock.bankrollSign);
		gameData.result = (gameData.valueBankroller == gameData.valuePlayer);
		return gameData;
	}
	
	_self.checkResult = function(gameDataBankroll, gameDataPlayer) {
		return (gameDataBankroll.result == gameDataPlayer.result);
	}
	
	_self.init();
	
	return _self;
};
