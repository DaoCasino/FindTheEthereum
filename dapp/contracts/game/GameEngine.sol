pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import '../library/SafeMath.sol';
import './GameObject.sol';
import {ISignidice } from '../interfaces/Interfaces.sol';

/**
* @title Dice game
* @dev Example of dice game
*/
contract GameEngine is GameObject {

    using SafeMath for uint;
    
    ISignidice public signidice;

    constructor (ISignidice _signidice) public {
        signidice = ISignidice(_signidice);
    }

    function game(gameData _gameData, uint256[] _bets, uint256[] _randoms) public view returns (int256[2]) {
        require(checkGameData(_gameData, _bets), 'invalid game data');
        
        uint256 randomNumber = _randoms[0];
         int256 playerProfit;
         int256 bankrollerProfit;
        
        if (_gameData.playerNumber >= randomNumber) {
            // player win 
            uint256 profit = getProfit(_gameData, _bets); 
            playerProfit     =  int256(profit);
            bankrollerProfit = -int256(profit);
        } else {
            // player lose
            playerProfit     = -int256(_bets[0]);
            bankrollerProfit =  int256(_bets[0]);
        }
        return([playerProfit, bankrollerProfit]);
    }

    function getProfit(gameData _gameData, uint256[] _bets) public pure returns(uint256 _profit) {
        uint _playerNumber = _gameData.playerNumber;
        uint _bet = _bets[0];
        uint _k = (uint(65535).mul(10000).div(_playerNumber)).div(10000);
        _profit = _bet.mul(_k).sub(_bet);
    }

    function getPenatlty(gameData _gameData, uint256[] _bets) public view returns(uint256) {
        return uint(42);
    }

    function resolveGame(gameData _gameData, uint256[] _bets, bytes _signature) public view returns(int256[2]) {
        uint256[] memory _randoms = signidice.generateRnd(_gameData.randomRanges, _signature);
        return game(_gameData, _bets, _randoms);
    }

}
