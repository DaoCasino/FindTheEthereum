pragma solidity ^0.4.19;
import './lib/oneStepGame.sol';

contract myDAppGame is oneStepGame {

    /**
    @notice constructor
    @param _token address of token contract
    @param _ref address of referrer contract
    @param _gameWL address of games whitelist contract
    @param _playerWL address of players whitelist contract
    @param _rsa address of rsa contract
    */
    constructor (
        ERC20Interface _token,
        RefInterface _ref,
        GameWLinterface _gameWL,
        PlayerWLinterface _playerWL,
        RSA _rsa
    )
        oneStepGame(_token, _ref, _gameWL, _playerWL, _rsa) public
    {
        developer = 0x42;
        
        config = Config({
            maxBet: 100 ether,
            minBet: 1 ether,
            gameDevReward: 25,
            bankrollReward: 25,
            platformReward: 25,
            refererReward: 25
        });   
    }

   /** 
    @notice interface for check game data
    @param _gameData Player's game data
    @param _bet Player's bet
    @return result boolean
    */
    function checkGameData(uint[] _gameData, uint _bet) public view returns (bool) {
        uint playerNumber = _gameData[0];
        require(_bet >= config.minBet && _bet <= config.maxBet);
        require(playerNumber >= 1 && playerNumber <= 3);
        return true;
    }

    /** 
    @notice interface for game logic
    @param _gameData Player's game data
    @param _bet Player's bet
    @param _sigseed random seed for generate rnd
    */
    function game(uint[] _gameData, uint _bet, bytes _sigseed) public view returns(bool _win, uint _amount) {   
        checkGameData(_gameData, _bet);
        uint _min = 1;
        uint _max = 3;
        uint _rndNumber = generateRnd(_sigseed, _min, _max);
        //gameData[0] - player number    
        uint _playerNumber = _gameData[0];
        uint _profit = getProfit(_gameData, _bet);

        // Game logic
        if (_playerNumber == _rndNumber) {
            // player win profit
            return(true, _profit);
        } else {
            // player lose bet
            return(false, _bet);
        }
    }

    /** 
    @notice profit calculation
    @param _gameData Player's game data
    @param _bet Player's bet
    @return profit
    */
    function getProfit(uint[] _gameData, uint _bet) public pure returns(uint _profit) {
        uint _playerNumber = _gameData[0];
        _profit = _bet.mul(_playerNumber);
    }

    /**
    @notice Generate random number from sig
    @param _sigseed Sign hash for creation random number
    @param _min Minimal random number
    @param _max Maximal random number
    @return random number
    */
    function generateRnd(bytes _sigseed, uint _min, uint _max) public pure returns(uint) {
        require(_max < 2**128);
        return uint256(keccak256(_sigseed)) % (_max.sub(_min).add(1)).add(_min);
    }
}