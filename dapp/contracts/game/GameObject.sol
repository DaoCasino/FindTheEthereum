pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract GameObject {
    
    struct gameData {
        //custom field
        uint256 playerNumber;
        
        // required field
        uint256[2][] randomRanges;
        bytes32      seed;
    }

    // If you use other custom field, add it in function
    function hashGameData(gameData _gameData) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(
            //_gameData.customField
            _gameData.playerNumber,
            _gameData.randomRanges,
            _gameData.seed
        ));
    }

    function checkGameData(gameData _gameData, uint[] _bets) public pure returns (bool) {
        if (
            _gameData.randomRanges.length != uint(1) ||
            _gameData.playerNumber < uint(0)         || 
            _gameData.playerNumber > uint(65535)     ||
            _bets[0] > 100 ether
            ) {
            return false;
        }
        return true;
    }

}