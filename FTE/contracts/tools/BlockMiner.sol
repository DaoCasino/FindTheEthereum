pragma solidity ^0.4.0; 

// used to "waste" blocks for truffle tests
contract BlockMiner {
    uint blocksMined;

    constructor () public {
        blocksMined = 0;
    }

    function mine() public {
       blocksMined += 1;
    }
}