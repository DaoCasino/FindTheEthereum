pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import '../gameChannel/GameChannel.sol';

contract MyDappGame is GameChannel {

    string public name = 'MyDappGame';

    constructor(
        IGameEngine _engine,
        IToken _token,
        IPlatform _platform,
        ISignidice _signidice
    )
        public GameChannel(_engine, _token, _platform, _signidice)
    {
        gameDevReward  = uint256(25);
        bankrollReward = uint256(25);
        platformReward = uint256(25);
        refererReward  = uint256(25);
        minBet         = uint256(1);
        developer      = address(0x42);
    }

    function getName() external view returns(string) {
        return name;
    }
}