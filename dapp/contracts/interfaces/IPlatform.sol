pragma solidity ^0.4.24;

interface IPlatform {
    function getService(address _player) external view returns(address _operator, address _referrer);
    function getStatus(address _game) external view returns(bool status);
    function getMaxAmount(address _player) external view returns(uint);
}