pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract ISignidice {
    function generateRnd(uint[2][] ranges, bytes _entropy) public pure returns(uint[]);
    function verify(bytes32 rawmsg, bytes N, bytes E, bytes S) public view returns (bool);
}