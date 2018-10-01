pragma solidity ^0.4.17;

contract ERC20Interface {
    function transfer(address _to, uint256 _value) public;
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success);
}

interface RefInterface {
    function getService(address _player) external constant returns(address _operator, address _referrer);
}

interface GameWLinterface {
    function getStatus(address _game) external view returns(bool status);
}

interface PlayerWLinterface {
    function getMaxAmount(address _player) external view returns(uint);
}

interface RSA {
    function verify(bytes32 rawmsg, bytes N, bytes E, bytes S) external view returns (bool);
}

contract gameInterface {
    function game(uint[] _gameData, uint _bet, bytes _rnd) public view returns(bool _win, uint _amount);
    function checkGameData(uint[] _gameData, uint _bet) public view returns(bool);
    function getProfit(uint[] _gameData, uint _bet) public pure returns(uint _profit);
}