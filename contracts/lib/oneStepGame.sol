pragma solidity ^0.4.23;

import './interfaces.sol';
import './SafeMath.sol';

contract oneStepGame is gameInterface {

    event logChannel(
        string  action,
        bytes32 id,             
        uint    playerBalance,
        uint    bankrollerBalance,
        uint    session
    );

    event logDispute(
        string  action,
        address initiator,
        bytes32 id,
        uint    session,
        bytes32 seed
    );

    using SafeMath for uint;

    address           public developer;
    Config            public config;
    uint              public safeTime = 120;
    ERC20Interface    public token;
    RefInterface      public refContract;
    GameWLinterface   public gameWL;
    PlayerWLinterface public playerWL;
    RSA               public rsa;

    /**
    @notice constructor
    @param _token address contract erc20
    @param _ref address of referrer contract
    @param _gameWL address of game whitelists
    @param _playerWL address of player whitelists
    @param _rsa address of RSA contract
    */
    constructor (
        ERC20Interface _token,
        RefInterface _ref,
        GameWLinterface _gameWL,
        PlayerWLinterface _playerWL,
        RSA _rsa
    )
        public
    {
        token       = ERC20Interface(_token);
        refContract = RefInterface(_ref);
        gameWL      = GameWLinterface(_gameWL);
        playerWL    = PlayerWLinterface(_playerWL);
        rsa         = RSA(_rsa);
    }
    
    struct Config {
        uint maxBet;
        uint minBet;
        uint8 gameDevReward;
        uint8 bankrollReward;
        uint8 platformReward;
        uint8 refererReward;
    }

    struct Channel {
        State   state;
        address player;            
        address bankroller;         
        uint    playerBalance;      
        uint    bankrollerBalance;    
        uint    totalBet;  
        uint    session;            
        uint    endBlock;
        uint[]  gameData;
        bytes32 RSAHash;
    }

    struct Dispute {
        bytes32 disputeSeed;
        uint[]  disputeGameData;
        uint    disputeBet;
        address initiator;
    }

    enum State {unused, open, close, dispute}
    mapping(bytes32 => Channel) public channels;
    mapping(bytes32 => Dispute) public disputes;

    modifier active(Channel _channel) {
        require((msg.sender == _channel.player) || (msg.sender == _channel.bankroller));
        require((_channel.endBlock > block.number) && ( (_channel.state == State.open) || (_channel.state == State.dispute)));
        _;
    }

    /**
    @notice Opening the channel and depositing funds
    @param _id Unique channel identifier
    @param _player player Address of the player
    @param _bankroller Address of the bankroller
    @param _playerBalance Player's deposit
    @param _bankrollerBalance Bankroller's deposit
    @param _openingBlock opening block
    @param _gameData Initial data (optional)
    @param _N N-component of bankroller's rsa public key 
    @param _E E-component of bankroller's rsa public key 
    @param _sign Signature from the player
    */
    function openChannel(
        bytes32 _id,
        address _player,
        address _bankroller,
        uint _playerBalance,
        uint _bankrollerBalance,
        uint _openingBlock,
        uint[] _gameData,
        bytes _N,
        bytes _E,
        bytes _sign
    )
        public
    {
        require(channels[_id].state == State.unused);
        require(_openingBlock.add(20) >= block.number);
        require(playerWL.getMaxAmount(_player) >= _playerBalance);
        require(gameWL.getStatus(this));
        address _signer = recoverSigner(keccak256(abi.encodePacked(_id, _player, _bankroller, _playerBalance, _bankrollerBalance, _openingBlock, _gameData, _N, _E)), _sign);
        require((_signer == _player || _signer == _bankroller) && (msg.sender != _signer));
        require(msg.sender == _player || msg.sender == _bankroller);
        require(token.transferFrom(_player, this, _playerBalance));
        require(token.transferFrom(_bankroller, this, _bankrollerBalance));

        Channel memory _channel = Channel({
            state: State.open,
            player: _player,
            bankroller: _bankroller,
            playerBalance: _playerBalance,
            bankrollerBalance: _bankrollerBalance,
            totalBet: 0,
            session:  0,
            endBlock: block.number.add(150),
            gameData: _gameData,
            RSAHash: keccak256(abi.encodePacked(keccak256(_N), keccak256(_E)))
        });

        channels[_id] = _channel;
        
        emit logChannel("open channel", _id, _playerBalance, _bankrollerBalance, 0);
    }

    /**
    @notice Update the state of the channel
    @param _id Unique channel identifier
    @param _playerBalance The player's account balance in the channel
    @param _bankrollerBalance The bankroller's account balance in the channel
    @param _session Number of the game session
    @param _sign Signature from the player or bankroller
    */
    function updateChannel(
        bytes32 _id,
        uint _playerBalance,
        uint _bankrollerBalance,
        uint _totalBet,
        uint _session,
        bytes _sign
    )
        public active(channels[_id])
    {
        Channel storage _channel = channels[_id];
        address stateSigner = recoverSigner(keccak256(abi.encodePacked(_id, _playerBalance, _bankrollerBalance, _totalBet, _session)), _sign);
        require(_channel.session < _session);
        require(stateSigner != msg.sender);
        require(stateSigner == _channel.player || stateSigner == _channel.bankroller);
        require(_playerBalance.add(_bankrollerBalance) == _channel.playerBalance.add(_channel.bankrollerBalance));

        if (_channel.endBlock.sub(block.number) < safeTime) {
            _channel.endBlock = block.number.add(safeTime);
        }

        _channel.session           = _session;
        _channel.playerBalance     = _playerBalance;
        _channel.bankrollerBalance = _bankrollerBalance;
        _channel.totalBet          = _totalBet;

        if (_channel.state == State.dispute) {
            _channel.state = State.open;
            delete disputes[_id];
        }

        emit logChannel("update channel", _id, _playerBalance, _bankrollerBalance, _session);
        checkGameOver(_id);
    }

    /**
    @notice Closing of the channel by consent of the parties
    @param _id Unique channel identifier
    @param _playerBalance The player's account balance in the channel
    @param _bankrollerBalance The bankroller's account balance in the channel
    @param _session Number of the game session
    @param _close Consent flag (true for closing)
    @param _sign Signature from the player or bankroller
    */
    function closeByConsent(
        bytes32 _id,
        uint _playerBalance,
        uint _bankrollerBalance,
        uint _totalBet,
        uint _session,
        bool _close,
        bytes _sign
    )
        public active(channels[_id])
    {
        Channel storage _channel = channels[_id];
        require(_close);
        address _signer = recoverSigner(keccak256(abi.encodePacked(_id, _playerBalance, _bankrollerBalance, _totalBet, _session, _close)), _sign);
        require(_playerBalance.add(_bankrollerBalance) == _channel.playerBalance.add(_channel.bankrollerBalance));
        require(_signer != msg.sender);
        require(_signer == _channel.player || _signer == _channel.bankroller);
        _channel.playerBalance = _playerBalance;
        _channel.bankrollerBalance = _bankrollerBalance;
        _channel.session = _session;
        _channel.totalBet = _totalBet;
        emit logChannel("close by consent", _id, _playerBalance, _bankrollerBalance, _session);
        closeChannel(_id);
    }

    /**
    @notice Closing the channel after the time has elapsed
    @param _id Unique channel identifier
    */
    function closeByTime(bytes32 _id) public {
        Channel storage _channel = channels[_id];
        require(_channel.endBlock < block.number);
        if (_channel.state == State.dispute) {
            closeByDispute(_id);
            return;
        }
        emit logChannel("close by time", _id, _channel.playerBalance, _channel.bankrollerBalance, _channel.session);
        closeChannel(_id);
    }

    /**
    @notice Closing the channel after the time with dispute
    @param _id Unique channel identifier
    */
    function closeByDispute(bytes32 _id) internal {
        Channel storage _channel = channels[_id];
        Dispute storage d = disputes[_id];
        require(d.initiator == _channel.player);
        uint _profit = getProfit(d.disputeGameData, d.disputeBet);
        _channel.bankrollerBalance = _channel.bankrollerBalance.sub(_profit);
        _channel.playerBalance     = _channel.playerBalance.add(_profit);
        closeChannel(_id);
    }

    /**
    @notice Check and close the channel at zero or min balance
    @param _id Unique channel identifier
    */
    function checkGameOver(bytes32 _id) internal {
        if (channels[_id].playerBalance < config.minBet || channels[_id].bankrollerBalance == 0) {
            emit logChannel("game over", _id, channels[_id].playerBalance, channels[_id].bankrollerBalance, channels[_id].session);
            closeChannel(_id);
        }
    }

    /**
    @notice To open a dispute 
    @param _id Unique channel identifier
    @param _session Number of the game session
    @param _disputeSeed seed for generate random
    @param _disputeBet Player's bet
    @param _gameData Player's game data
    @param _sign Player's game data sign
    */
    function openDispute(
        bytes32 _id,
        uint _session,
        uint _disputeBet,
        uint[] _gameData,
        bytes32 _disputeSeed,
        bytes _sign
    )
        public active(channels[_id])
    {
        Channel storage _channel = channels[_id];
        require(_session == _channel.session.add(1));
        address _signer = recoverSigner(keccak256(abi.encodePacked(_id, _session, _disputeBet, _gameData, _disputeSeed)), _sign);
        require(_signer == _channel.player);
        require(checkGameData(_gameData, _disputeBet));
        require(getProfit(_gameData, _disputeBet) <= _channel.bankrollerBalance);
        
        if (_channel.endBlock.sub(block.number) < safeTime) {
            _channel.endBlock = block.number.add(safeTime);
        }

        Dispute memory _dispute = Dispute({
            disputeSeed: _disputeSeed,
            disputeGameData: _gameData,
            disputeBet: _disputeBet,
            initiator: msg.sender
        });
        _channel.totalBet = _channel.totalBet.add(_disputeBet);
        disputes[_id] = _dispute;
        _channel.state = State.dispute;
        emit logDispute("open dispute", msg.sender, _id, _session, _disputeSeed);
    }

    /**
    @notice Closing of the channel on the dispute
    @param _id Unique channel identifier
    @param _N N-component of bankroller's rsa public key 
    @param _E E-component of bankroller's rsa public key 
    @param _rsaSign sign for generate random
    */
    function resolveDispute(
        bytes32 _id,
        bytes _N,
        bytes _E,
        bytes _rsaSign
    )
        public
    {
        Channel storage _channel = channels[_id];
        Dispute storage d = disputes[_id];
        require(_channel.state == State.dispute);
        require(msg.sender == _channel.bankroller);
        if (d.initiator == _channel.player) {  
            require(_channel.endBlock > block.number);
        } else if (d.initiator == _channel.bankroller) {
            require(_channel.endBlock < block.number);
        }
        require(keccak256(abi.encodePacked(keccak256(_N), keccak256(_E))) == _channel.RSAHash);
        require(rsa.verify(keccak256(abi.encodePacked(_id, _channel.session.add(1), d.disputeBet, d.disputeGameData, d.disputeSeed)), _N, _E, _rsaSign));                     
        runGame(_id, d.disputeBet, _rsaSign);
    }

    /**
    @notice run last game round after dispute
    @param _id Unique channel identifier
    @param _bet Player bet in last round
    @param _sign Sign for creation random number
    */
    function runGame(bytes32 _id, uint _bet, bytes _sign) internal {
        bool _win;
        uint _profit;
        Channel storage _channel = channels[_id];
        (_win, _profit) = game(disputes[_id].disputeGameData, _bet, _sign);
        if (_win) {
            _channel.bankrollerBalance = _channel.bankrollerBalance.sub(_profit);
            _channel.playerBalance = _channel.playerBalance.add(_profit);
        } else {
            _channel.playerBalance = _channel.playerBalance.sub(_bet);
            _channel.bankrollerBalance = _channel.bankrollerBalance.add(_bet);
        }
        emit logChannel("resolve dispute", _id, _channel.playerBalance, _channel.bankrollerBalance, _channel.session); 
        closeChannel(_id);
    }

    /**
    @notice Internal function for for sending funds
    @param _id Unique channel identifier
    */
    function closeChannel(bytes32 _id) internal {
        Channel storage _channel = channels[_id];
        uint _forReward        = _channel.totalBet.mul(20).div(1000);
        uint _bankrollerReward = _forReward.mul(config.bankrollReward).div(100);
        uint _forPlayer     = _channel.playerBalance;
        uint _forBankroller = uint(0);
        if(_forReward > _channel.bankrollerBalance) {
            _forPlayer = _forPlayer.sub(_forReward);
        } else {
            _forBankroller = ((_channel.bankrollerBalance.add(_bankrollerReward).sub(_forReward)));
        }
        serviceReward(_channel.player, _forReward);
        token.transfer(_channel.bankroller, _forBankroller);        
        token.transfer(_channel.player, _forPlayer);
        _channel.state = State.close;
        delete _channel.playerBalance;
        delete _channel.bankrollerBalance;
        if (_channel.state == State.dispute) {
           delete disputes[_id];
        }
        emit logChannel("close channel", _id, _channel.playerBalance, _channel.bankrollerBalance, _channel.session); 
    }

    /**
    @notice Transfer reward to game developer, bankroller, platform and referrer
    @param _player player's address
    @param _value Total for distribution
    */
    function serviceReward(address _player, uint256 _value) internal {
        address _platform;
        address _referrer;
        (_platform, _referrer) = refContract.getService(_player);
        token.transfer(developer,  _value.mul(config.gameDevReward).div(100));
        token.transfer(_platform,  _value.mul(config.platformReward).div(100));
        token.transfer(_referrer,  _value.mul(config.refererReward).div(100));
    }

    /**
    @notice Recover address from signature and hash
    @param _hash Hash for signature
    @param signature Signature hash
    @return The subscriber hash address
    */
    function recoverSigner(bytes32 _hash, bytes signature) public pure returns(address) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        (r, s, v) = signatureSplit(signature);
        return ecrecover(_hash, v, r, s);
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
    function signatureSplit(bytes signature) internal pure returns(bytes32 r, bytes32 s, uint8 v) {
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 0xff)
        }
        require(v == 27 || v == 28);
    }
}