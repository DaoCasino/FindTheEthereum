pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import {IGameEngine, IToken, IPlatform, ISignidice} from '../interfaces/Interfaces.sol';
import '../game/GameObject.sol';
import '../library/SafeMath.sol';
import '../library/Utils.sol';

contract GameChannel is GameObject {

    event logChannel(
        string  action,
        bytes32 id
    );

    using SafeMath for uint;

    IGameEngine public engine;
    IToken      public token;
    IPlatform   public platform;
    ISignidice  public signidice;
    /**
    @notice constructor
    @param _engine address contract erc20
    @param _token address contract erc20
    @param _platform address of platform contract
    @param _signidice address of signidice contract
    */
    constructor (
        IGameEngine _engine,
        IToken      _token,
        IPlatform   _platform,
        ISignidice  _signidice
    )
        public
    {
        engine    = IGameEngine(_engine);
        token     = IToken(_token);
        platform  = IPlatform(_platform);
        signidice = ISignidice(_signidice);
    }

    uint256 public gameDevReward;
    uint256 public bankrollReward;
    uint256 public platformReward;
    uint256 public refererReward;
    address public developer;
    uint256 public minBet;
    uint256 public safeTime = uint256(120);

    struct Channel {
        State   state;
        address player;            
        address bankroller;         
        uint256 playerBalance;      
        uint256 bankrollerBalance;    
        uint256 totalBet;  
        uint256 session;            
        uint256 endBlock;
        bytes32 RSAHash;
    }

    struct Dispute {
        uint256[] disputeBets;
        gameData  disputeGameData;
    }

    enum State {unused, open, close, dispute}
    mapping(bytes32 => Channel) public channels;
    mapping(bytes32 => Dispute) public disputes;

    modifier active(Channel _channel) {
        require((msg.sender == _channel.player) || (msg.sender == _channel.bankroller), 'invalid sender');
        require((_channel.endBlock > block.number), 'invalid time');
        require((_channel.state == State.open) || (_channel.state == State.dispute), 'invalid state');
        _;
    }

    /**
    @notice Opening the channel and depositing funds
    @param _id                Unique channel identifier
    @param _player            player Address of the player
    @param _bankroller        Address of the bankroller
    @param _playerBalance     Player's deposit
    @param _bankrollerBalance Bankroller's deposit
    @param _openingBlock      opening block
    @param _N                 N-component of bankroller's rsa public key 
    @param _E                 E-component of bankroller's rsa public key 
    @param _signature         Signature from the player
    */
    function openChannel(
        bytes32 _id,
        address _player,
        address _bankroller,
        uint256 _playerBalance,
        uint256 _bankrollerBalance,
        uint256 _openingBlock,
        bytes   _N,
        bytes   _E,
        bytes   _signature
    )
        public
    {
        address _signer = Utils.recoverSigner(keccak256(abi.encodePacked(_id, _player, _bankroller, _playerBalance, _bankrollerBalance, _openingBlock, _N, _E)), _signature);
        require(channels[_id].state == State.unused, 'used id');
        require(_openingBlock.add(20) >= block.number, 'outdate signature');
        require(platform.getMaxAmount(_player) >= _playerBalance, 'invalid amount');
        require(platform.getStatus(this), 'invalid status');
        require((_signer == _player || _signer == _bankroller) && (msg.sender != _signer), 'invalid signer');
        require(msg.sender == _player || msg.sender == _bankroller, 'invalid sender');
        
        require(token.transferFrom(_player, this, _playerBalance), 'fail transfer from player');
        require(token.transferFrom(_bankroller, this, _bankrollerBalance), 'fail transfe from bankroller');

        Channel memory _channel = Channel({
            state             : State.open,
            player            : _player,
            bankroller        : _bankroller,
            playerBalance     : _playerBalance,
            bankrollerBalance : _bankrollerBalance,
            totalBet          : uint(0),
            session           : uint(0),
            endBlock          : block.number.add(150),
            RSAHash           : keccak256(abi.encodePacked(keccak256(_N), keccak256(_E)))
        });

        channels[_id] = _channel;
        
        emit logChannel("open channel", _id);
    }

    /**
    @notice Update the state of the channel
    @param _id Unique channel identifier
    @param _playerBalance The player's account balance in the channel
    @param _bankrollerBalance The bankroller's account balance in the channel
    @param _totalBet blabla
    @param _session Number of the game session
    @param _signature Signature from the player or bankroller
    */
    function updateChannel(
        bytes32 _id,
        uint256 _playerBalance,
        uint256 _bankrollerBalance,
        uint256 _totalBet,
        uint256 _session,
        bytes   _signature
    )
        public active(channels[_id])
    {
        Channel storage _channel = channels[_id];
        address stateSigner = Utils.recoverSigner(keccak256(abi.encodePacked(_id, _playerBalance, _bankrollerBalance, _totalBet, _session)), _signature);
        require(_channel.session < _session, 'outdate session');
        require(stateSigner != msg.sender, 'invalid state singer');
        require(stateSigner == _channel.player || stateSigner == _channel.bankroller, 'state signer is not member');
        require(_playerBalance.add(_bankrollerBalance) == _channel.playerBalance.add(_channel.bankrollerBalance), 'invalid new balances');

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

        emit logChannel("update channel", _id);
        checkGameOver(_id);
    }

    /**
    @notice Closing of the channel by consent of the parties
    @param _id Unique channel identifier
    @param _playerBalance The player's account balance in the channel
    @param _bankrollerBalance The bankroller's account balance in the channel
    @param _totalBet The bankroller's account balance in the channel
    @param _session Number of the game session
    @param _sign Signature from the player or bankroller
    */
    function closeByConsent(
        bytes32 _id,
        uint256 _playerBalance,
        uint256 _bankrollerBalance,
        uint256 _totalBet,
        uint256 _session,
        bytes   _sign
    )
        public active(channels[_id])
    {
        Channel storage _channel = channels[_id];
        address _signer = Utils.recoverSigner(keccak256(abi.encodePacked(_id, _playerBalance, _bankrollerBalance, _totalBet, _session, true)), _sign);
        require(_playerBalance.add(_bankrollerBalance) == _channel.playerBalance.add(_channel.bankrollerBalance), 'invalid balances');
        require(_signer != msg.sender, 'invalid signer');
        require(_signer == _channel.player || _signer == _channel.bankroller, 'signer is not member');
        _channel.playerBalance     = _playerBalance;
        _channel.bankrollerBalance = _bankrollerBalance;
        _channel.session           = _session;
        _channel.totalBet          = _totalBet;
        emit logChannel("close by consent", _id);
        closeChannel(_id);
    }

    /**
    @notice Closing the channel after the time has elapsed
    @param _id Unique channel identifier
    */
    function closeByTime(bytes32 _id) public {
        Channel storage _channel = channels[_id];
        require(_channel.endBlock < block.number, "invalid block");
        if (_channel.state == State.dispute) {
            closeByDispute(_id);
            return;
        }
        emit logChannel("close by time", _id);
        closeChannel(_id);
    }

    /**
    @notice Closing the channel after the time with dispute
    @param _id Unique channel identifier
    */
    function closeByDispute(bytes32 _id) internal {
        Channel storage _channel = channels[_id];
        Dispute storage _dispute = disputes[_id];
        // TODO time check
        uint256 _penalty = engine.getPenatlty(_dispute.disputeGameData, _dispute.disputeBets);
        _channel.bankrollerBalance = _channel.bankrollerBalance.sub(_penalty);
        _channel.playerBalance     = _channel.playerBalance.add(_penalty);
        closeChannel(_id);
    }

    /**
    @notice Check and close the channel at zero or min balance
    @param _id Unique channel identifier
    */
    function checkGameOver(bytes32 _id) internal {
        if (channels[_id].playerBalance < minBet || channels[_id].bankrollerBalance == 0) {
            emit logChannel("game over", _id);
            closeChannel(_id);
        }
    }

    /**
    @notice To open a dispute 
    @param _id Unique channel identifier
    @param _session Number of the game session
    @param _disputeBets Player's bet
    @param _gameData Player's game data
    @param _signature Player's game data signature
    */
    function openDispute(
        bytes32   _id,
        uint256   _session,
        uint256[] _disputeBets,
        gameData  _gameData,
        bytes     _signature
    )
        public active(channels[_id])
    {
        Channel storage _channel = channels[_id];
        require(_session == _channel.session.add(1), 'invalid session');
        bytes32 _gameDataHash = hashGameData(_gameData);
        address _signer = Utils.recoverSigner(keccak256(abi.encodePacked(_id, _session, _disputeBets, _gameDataHash)), _signature);
        require(_signer == _channel.player, 'signer is not a player');
        require(checkGameData(_gameData, _disputeBets), 'invalid gameData');
        require(engine.getProfit(_gameData, _disputeBets) <= _channel.bankrollerBalance, 'invalid profit');
        
        if (_channel.endBlock.sub(block.number) < safeTime) {
            _channel.endBlock = block.number.add(safeTime);
        }

        Dispute memory _dispute = Dispute({
            disputeBets     : _disputeBets,
            disputeGameData : _gameData
        });

        //_channel.totalBet = _channel.totalBet.add(_disputeBets);
        disputes[_id]  = _dispute;
        _channel.state = State.dispute;
        emit logChannel("open dispute", _id);
    }

    /**
    @notice Closing of the channel on the dispute
    @param _id Unique channel identifier
    @param _N  N-component of bankroller's rsa public key 
    @param _E  E-component of bankroller's rsa public key 
    @param _rsaSignature sign for generate random
    */
    function resolveDispute(
        bytes32 _id,
        bytes   _N,
        bytes   _E,
        bytes   _rsaSignature
    )
        public
    {
        Channel storage _channel = channels[_id];
        Dispute storage _dispute = disputes[_id];
        bytes32 _gameDataHash = hashGameData(_dispute.disputeGameData);
        bytes32 _hash = keccak256(abi.encodePacked(_id, _channel.session.add(1), _dispute.disputeBets, _gameDataHash));
        require(_channel.state == State.dispute, 'invalid status');
        require(msg.sender == _channel.bankroller, 'invalid sender');
        
        // check time!
        
        require(keccak256(abi.encodePacked(keccak256(_N), keccak256(_E))) == _channel.RSAHash, 'invalid public');
        require(signidice.verify(_hash, _N, _E, _rsaSignature), 'invalid verify');                     
        resolve(_id, _rsaSignature);
    }

    /**
    @notice run last game round after dispute
    @param _id Unique channel identifier
    @param _signature Sign for creation random number
    */
    function resolve(bytes32 _id, bytes _signature) internal {
        Channel storage _channel = channels[_id];
        Dispute storage _dispute = disputes[_id];

        int256[2] memory profit = engine.resolveGame(_dispute.disputeGameData, _dispute.disputeBets, _signature);

        // add overflow require
        _channel.playerBalance     = uint256(int256(_channel.playerBalance) + profit[0]);      
        _channel.bankrollerBalance = uint256(int256(_channel.playerBalance) + profit[1]);   

        emit logChannel("resolve dispute", _id); 
        closeChannel(_id);
    }

    /**
    @notice Internal function for for sending funds
    @param _id Unique channel identifier
    */
    function closeChannel(bytes32 _id) internal {
        Channel storage _channel = channels[_id];
        uint256 _forReward          = _channel.totalBet.mul(20).div(1000);
        uint256 _bankrollerReward   = _forReward.mul(bankrollReward).div(100);
        uint256 _forPlayer          = _channel.playerBalance;
        uint256 _forBankroller      = uint(0);
        
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
        emit logChannel("close channel", _id); 
    }

    /**
    @notice Transfer reward to game developer, bankroller, platform and referrer
    @param _player player's address
    @param _value Total for distribution
    */
    function serviceReward(address _player, uint256 _value) internal {
        address _platform;
        address _referrer;
        (_platform, _referrer) = platform.getService(_player);
        token.transfer(developer, _value.mul(gameDevReward).div(100));
        token.transfer(_platform, _value.mul(platformReward).div(100));
        token.transfer(_referrer, _value.mul(refererReward).div(100));
    }

}