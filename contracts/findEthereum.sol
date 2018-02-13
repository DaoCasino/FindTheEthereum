/*
       _____         __  __  __         ______  __                        
      / __(_)__  ___/ / / /_/ /  ___   / __/ /_/ /  ___ _______ __ ____ _ 
     / _// / _ \/ _  / / __/ _ \/ -_) / _// __/ _ \/ -_) __/ -_) // /  ' \
    /_/ /_/_//_/\_,_/  \__/_//_/\__/ /___/\__/_//_/\__/_/  \__/\_,_/_/_/_/
                                                                      

    version 1.0.3

    Smart contract of "Find the Ethereum" game

*/

pragma solidity ^0.4.13;

// Interface for interaction with ERC20 standart token .
// more about erc20 standart: https://github.com/ethereum/eips/issues/20
import "../common/ERC20.sol";

// Interface for interaction with referrer contract.
import "../common/RefInterface.sol";

/**
@title "Find the Ethereum" Game
*/
contract findEthereum {

    // Structure 'Channel' contains all the information about the channel:
    struct Channel {
        address player;             // player address
        address bankroller;         // bankroller address
        uint    playerBalance;      // player balance
        uint    bankrollBalance;    // bankroller balance
        uint    bankrollDeposit;    // Bankroll balance at the beginning of the game
        uint    session;            // the number of last session
        uint    endBlock;           // block number of the closure
        uint    round;              // round in actual session
        uint[]  gameData;           // game data in actual session
    }

    // Structure 'Dispute' contains all the information about the dispute:
    struct Dispute {
        uint    round;              // dispute round
        bytes32 disputeSeed;        // dispute seed for signidice
        uint[]  disputeGameData;    // dispute game data
    }

    // Addresses of game developer, token contract, referrer contract.
    address public developer          = 0x6506e2D72910050554D0C47500087c485DAA9689;    // game developer address for reward 
    address public erc20Address       = 0x95a48dca999c89e4e284930d9b9af973a7481287;    //testnet dao.casino token address
    address public refContractAddress = 0xa285e7fc42f5cf5df344523adf781a99f63ae71f;    //testnet referrer contract address

    ERC20 token              = ERC20(erc20Address);
    RefInterface refContract = RefInterface(refContractAddress);

    uint public totalMoneySend  = 0;  // total amount of funds sent
    uint public totalMoneyPaid  = 0;  // Total amount of funds received
    uint public totalChannels   = 0;  // total amount of channels

    uint8 public gameDevReward  = 25;  // game developer reward 25% from profit
    uint8 public platformReward = 25;  // platform reward 25% from profit
    uint8 public refererReward  = 25;  // referrer reward 25% from profit
    uint8 public bankrollReward = 25;  // bankroller reward 25% from profit

    uint public rndMinNumber    = 1;   // minimum random number
    uint public rndMaxNumber    = 3;   // maximum random number

    uint public constant minBet = 1000000;     // minimal bet
    uint public constant maxBet = 1000000000;  // maximal bet

    mapping(bytes32 => Channel) public channels;    // Mapping 'channels' stores the struct 'Channel' by the key 'id'.
    mapping(bytes32 => Dispute) public disputes;    // Mapping 'disputes' stores the struct 'Dispute' by the key 'id'.

    event logChannel(
        string  action,             // Called action
        bytes32 id,                 // id of channel
        uint    playerBalance,      // Player balance state in the channel
        uint    bankrollBalance,    // Bankroll balance state in the channel
        uint    session               // Number of iteration
    );

    event logDispute(
        string  action,     // Called action
        bytes32 id,         // id of channel
        uint    session,    // Number of iteration
        bytes32 seed        // Seed for random
    );

    // Only player or bankroller can call contract function.
    // They can only call functions of an open and an existing channel.
    modifier active(Channel self) {
        require(msg.sender == self.player || msg.sender == self.bankroller);
        require(self.endBlock > block.number);
        require(self.endBlock != 0);
        _;
    }

    /**
    @notice Opening the channel and depositing funds
    @param id Unique channel identifier
    @param player player Address of the player
    @param bankroller Address of the bankroller
    @param playerDeposit Player's deposit
    @param bankrollDeposit Bankroller's deposit
    @param session Number of the game session (0 for openning)
    @param time Time of the channel
    @param gameData Initial data (optional)
    @param sig Signature from the player
    */
    function openChannel(bytes32 id, address player, address bankroller, uint playerDeposit, uint bankrollDeposit, uint session, uint time, uint[] gameData, bytes sig) public {

        require(channels[id].endBlock == 0);
        require(session               == 0);
        require(msg.sender  ==  bankroller);
        require(recoverSigner(keccak256(id, player, bankroller, playerDeposit, bankrollDeposit, session, time, gameData), sig) == player);

        require(token.transferFrom(player,     this, playerDeposit));
        require(token.transferFrom(msg.sender, this, bankrollDeposit));

        channels[id].player          = player;
        channels[id].bankroller      = bankroller;
        channels[id].playerBalance   = playerDeposit;
        channels[id].bankrollDeposit = bankrollDeposit;
        channels[id].bankrollBalance = bankrollDeposit;
        channels[id].session         = 0;
        channels[id].endBlock        = block.number + time;
        channels[id].gameData        = gameData;

        logChannel("open channel", id, playerDeposit, bankrollDeposit, session);
        totalChannels++;
    }

    /**
    @notice Update the state of the channel
    @param id Unique channel identifier
    @param playerBalance The player's account balance in the channel
    @param bankrollBalance The bankroller's account balance in the channel
    @param session Number of the game session
    @param sig Signature from the player or bankroller
    */
    function updateChannel(bytes32 id, uint playerBalance, uint bankrollBalance, uint session, bytes sig) public active(channels[id]) {
        require(channels[id].session < session);
        address stateSigner = recoverSigner(keccak256(id, playerBalance, bankrollBalance, session), sig);
        require(stateSigner != msg.sender);
        require(playerBalance + bankrollBalance <= channels[id].playerBalance + channels[id].bankrollBalance);
        if (channels[id].endBlock - block.number < 10) {
            channels[id].endBlock += 10;
        }
        channels[id].session         = session;
        channels[id].playerBalance   = playerBalance;
        channels[id].bankrollBalance = bankrollBalance;

        channels[id].gameData = [0,0,0];
        delete channels[id].round;
        disputes[id].disputeGameData = [0,0,0];
        delete disputes[id].disputeSeed;
        delete disputes[id].round;

        logChannel("update channel", id, playerBalance, bankrollBalance, session);
        ifZero(id);
    }

    /**
    @notice Internal function for for sending funds
    @param id Unique channel identifier
    */
    function closeChannel(bytes32 id) internal {
        if (channels[id].bankrollDeposit < channels[id].bankrollBalance) {
            uint profit = channels[id].bankrollBalance - channels[id].bankrollDeposit;
            serviceReward(channels[id].player, channels[id].bankroller, profit);
            token.transfer(channels[id].bankroller, channels[id].bankrollDeposit);
            } else{
                token.transfer(channels[id].bankroller, channels[id].bankrollBalance);
            }
        token.transfer(channels[id].player, channels[id].playerBalance);
        channels[id].playerBalance   = 0;
        channels[id].bankrollBalance = 0;
        channels[id].bankrollDeposit = 0;
    }

    /**
    @notice Closing of the channel by consent of the parties
    @param id Unique channel identifier
    @param playerBalance The player's account balance in the channel
    @param bankrollBalance The bankroller's account balance in the channel
    @param session Number of the game session
    @param close Consent flag (true for closing)
    @param sig Signature from the player or bankroller
    */
    function closeByConsent(bytes32 id, uint playerBalance, uint bankrollBalance, uint session, bool close, bytes sig) public active(channels[id]) {
        require(close);
        require(disputes[id].disputeSeed == 0);
        require(playerBalance + bankrollBalance <= channels[id].playerBalance + channels[id].bankrollBalance);
        address signer = recoverSigner(keccak256(id, playerBalance, bankrollBalance, session, close), sig);
        require(signer != msg.sender);
        require(signer == channels[id].player || signer == channels[id].bankroller);
        channels[id].playerBalance   = playerBalance;
        channels[id].bankrollBalance = bankrollBalance;
        logChannel("close by consent", id, playerBalance, bankrollBalance, session);
        closeChannel(id);
    }

    /**
    @notice Update game state
    @param id Unique channel identifier
    @param session Number of the game session
    @param round Number of the game round in session
    @param seed Seed from player for generate random
    @param gameData Game data in round
    @param sig Sign from player
    @param sigSeed Sign from bankroller
    */
    function updateGame(bytes32 id, uint session, uint round, bytes32 seed, uint[] gameData, bytes sig, bytes sigSeed) public active(channels[id]) {
        Channel memory c   = channels[id];
        address signer     = recoverSigner(keccak256(id, session, round, seed, gameData), sig);
        address seedSigner = recoverSigner(keccak256(id, session, round, seed, gameData), sigSeed);

        require(session    == c.session + 1);
        require(seedSigner == c.bankroller);
        require(signer     == c.player);

        channels[id].gameData = gameData;
        channels[id].session  = session;
        channels[id].round    = round;
    }

    /**
    @notice Opening of the dispute
    @param id Unique channel identifier
    @param session Number of the game session
    @param round Number of the game round in session
    @param disputeSeed unsigned seed
    @param gameData Game data in round
    */
    function openDispute(bytes32 id, uint session, uint round, bytes32 disputeSeed, uint[] gameData) public active(channels[id]) {
        Channel memory c   = channels[id];
        require(round      == c.round + 1);
        
        if(c.round < 1){
			require(session == c.session + 1);
        }else{ 
            require(session  == c.session);
            require(gameData[0] == c.gameData[0]);
        }
        
        checkGameData(c.gameData, gameData);
        if (channels[id].endBlock - block.number < 10) {
            channels[id].endBlock += 10;
        }
        disputes[id] = Dispute(round, disputeSeed, gameData);
        logDispute("open dispute", id, c.session, disputeSeed);
    }

    /**
    @notice Closure of the dispute
    @param id Unique channel identifier
    @param sigseed sign from bankroller
    */
    function closeDispute(bytes32 id, bytes sigseed) public active(channels[id]) {
        Channel memory c = channels[id];
        Dispute memory d = disputes[id];
        require(d.disputeSeed != 0);
        require(recoverSigner(d.disputeSeed, sigseed) == c.bankroller);
        var rnd = createRnd(sigseed, rndMinNumber, rndMaxNumber);
        game(id, c.gameData, d.disputeGameData, rnd, false);
        logDispute("close dispute", id, channels[id].session, disputes[id].disputeSeed);
        closeChannel(id);
    }

    /**
    @notice Closing the channel after the time has elapsed
    @param id Unique channel identifier
    */
    function closeByTime(bytes32 id) public {
        require(channels[id].endBlock < block.number);
        if (disputes[id].disputeSeed != 0) {
            game(id, channels[id].gameData, disputes[id].disputeGameData, 0, true);
        }
        logChannel("close by time", id, channels[id].playerBalance, channels[id].bankrollBalance, channels[id].session);
        closeChannel(id);
    }

    /**
    @notice Check game data
    @param oldGameData The state of game in the previous round
    @param newGameData The state of game in the current round
    */
    function checkGameData(uint[] oldGameData, uint[] newGameData) public pure {
        // gameData[0] - bet
        // gameData[1] - winstreak
        // gameData[2] - player number
        
        var bet          = newGameData[0];
        var winstreak    = newGameData[1];
        var oldWinstreak = oldGameData[1];
        var playerNumber = newGameData[2];

        require(bet >= minBet     && bet <= maxBet);
        require(winstreak < 5     && winstreak == oldWinstreak);
        require(playerNumber >= 1 && playerNumber <= 3);

    }

    /**
    @notice The logic of the game.
    @param id Unique channel identifier
    @param oldGameData The state of game in the previous round.
    @param disputeGameData The state of game in the dispute round.
    @param rnd random number
    @param gameOver Flag for winning the player (if dispute open after the expiration of time)
    */
    function game(bytes32 id, uint[] oldGameData, uint[] disputeGameData, uint rnd, bool gameOver) view internal {

        /*
         gameData[0] - bet
         gameData[1] - winstreak
         gameData[2] - player value
         */

        var profitTable = [0, 2, 4, 10, 20, 50];
        uint bet        = disputeGameData[0];
        uint winstreak  = disputeGameData[1];
        uint valPlayer  = disputeGameData[2];
        uint profit     = bet * profitTable[winstreak];

        if (profit > channels[id].bankrollBalance) {
            profit = channels[id].bankrollBalance;
        }
        if (gameOver) {
            win(channels[id], profit);
            return;
        } 
        if (rnd == valPlayer) {
            win(channels[id], profit);
        } else {
             lose(channels[id], bet);
        }
    }

    /**
    @notice Check and close the channel at zero balance
    @param id Unique channel identifier
    */
    function ifZero(bytes32 id) internal {
        if (channels[id].playerBalance == 0 || channels[id].bankrollBalance == 0) {
            logChannel("game over", id, channels[id].playerBalance, channels[id].bankrollBalance, channels[id].session);
            closeChannel(id);
        }
    }

    /**
    @notice Update the channel state in the direction of the player
    @param self Channel structure
    @param value Value to update
    */
    function win(Channel self, uint value) internal pure {
        self.bankrollBalance -= value;
        self.playerBalance   += value;
    }

    /**
    @notice Update the channel state in the direction of the bankroller
    @param self Channel structure
    @param value Value to update
    */
    function lose(Channel self, uint value) internal pure {
        self.playerBalance   -= value;
        self.bankrollBalance += value;
    }

    /**
    @notice Transfer reward to game developer, bankroller, platform and referrer
    @param _player player's address
    @param _bankroller bankroller's address
    @param _value Total for distribution
    */
    function serviceReward(address _player, address _bankroller, uint256 _value) internal {
        var (platform, referrer) = refContract.getService(_player);
        token.transfer(developer,   _value * gameDevReward  / 100);
        token.transfer(_bankroller, _value * bankrollReward / 100);
        token.transfer(platform,    _value * platformReward / 100);
        token.transfer(referrer,    _value * refererReward  / 100);
    }

    /**
    @notice Transfer reward to game developer, bankroller, platform and referrer
    @param sigseed Sign hash for creation random number
    @param min Minimal random number
    @param max Maximal random number
    @return random random number
    */
    function createRnd(bytes sigseed, uint min, uint max) public pure returns(uint random) {
        return uint256(keccak256(sigseed)) % (max - min) + min;
    }

    /**
    @notice Recover address from signature and hash
    @param h Hash for signature
    @param signature Signature hash
    @return The subscriber hash address
    */
    function recoverSigner(bytes32 h, bytes signature) public pure returns(address) {
        var (r, s, v) = signatureSplit(signature);
        return ecrecover(h, v, r, s);
    }

    /**
    @notice Split signature on v,r,s components
    @param signature Signature hash
    @return {
    "r": "r-component of the signature"
    "s": "s-component of the signature"
    "v": "v-component of the signature"
    }
    */
    function signatureSplit(bytes signature) public pure returns(bytes32 r, bytes32 s, uint8 v) {
        assembly {
            r: = mload(add(signature, 32))
            s: = mload(add(signature, 64))
            v: = and(mload(add(signature, 65)), 0xff)
        }
        require(v == 27 || v == 28);
    }

        //!!!!____FUNCTION ONLY FOR TESTNET TESTING!_____
    function withdrawAll(uint bet, uint eth) public{
        token.transfer(msg.sender, bet);
        msg.sender.transfer(eth);
    }
}