pragma solidity ^0.4.24;

import './rsa.sol';

contract Signidice is RSA {

    /**
    @notice Generate random ranges
    @param _ranges ranges array
    @param _entropy entropy for generation
    */
    function generateRnd(uint[2][] _ranges, bytes _entropy) external pure returns(uint[]) {
        uint[] memory randoms = new uint[](_ranges.length);
        for (uint i = 0; i < _ranges.length; i++) {
            uint256[2] memory range = _ranges[i];
            
            uint256 min   = range[0];
            uint256 max   = range[1];
            uint256 delta = (max - min + 1);
            
            bytes32 lucky = keccak256(abi.encodePacked(_entropy, uint256(i)));
            
            while (uint256(lucky) >= (2**(256-1)/delta) * delta) {
                lucky = keccak256(abi.encodePacked(lucky));
            }

            uint256 result = (uint256(lucky) % (delta)) + min;
            randoms[i] = result;
        }
        return randoms;
    }

} 