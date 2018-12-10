pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import '../game/GameObject.sol';

contract IGameEngine is GameObject {
    function game(gameData  _gameData, uint256[]  _bets, uint256[]  _randoms) public view returns (int256[2]);
    function getProfit(gameData _gameData, uint256[] _bets) public pure returns (uint256 _profit);
    function getPenatlty(gameData _gameData, uint256[] _bets) public view returns(uint256);
    function resolveGame(gameData _gameData, uint256[] _bets, bytes _signature) public returns(int256[2]);
}
