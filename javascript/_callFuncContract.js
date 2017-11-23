// updateChannel(bytes32 id, uint playerBalance, uint bankrollBalance, uint session, bytes sig)

async _callFuncContract(params){
	const response_room = this.users[params.user_id].room

	console.log('_callFuncContract', params)
	
	const channel_id         = params.open_args.channel_id
	const player_address     = params.user_id
	const bankroller_address = _openkey
	const player_deposit     = params.open_args.player_deposit
	const bankroller_deposit = params.open_args.player_deposit*2
	const session            = params.open_args.session
	const ttl_blocks         = params.open_args.ttl_blocks
	const signed_args        = params.open_args.signed_args


	const approve = await ERC20approve(this.PayChannel().options.address, bankroller_deposit*1000)

	console.log(channel_id, player_address, bankroller_address, player_deposit, bankroller_deposit, session, ttl_blocks)

	const rec_openkey = web3.eth.accounts.recover( Utils.sha3(channel_id, player_address, bankroller_address, player_deposit, bankroller_deposit, session, ttl_blocks), signed_args )
	if (player_address!=rec_openkey) {
		console.error('🚫 invalid sig on open channel', rec_openkey)
		this.response(params, { error:'Invalid sig' }, response_room)
		return
	}
	// estimateGas - в данном случае работает неккоректно и 
	// возвращает лимит газа аж на целый блок
	// из-за чего транзакцию никто не майнит, т.к. она одна на весь блок
	// const gasLimit = await this.PayChannel().methods.open(channel_id,player_address,bankroller_address,player_deposit,bankroller_deposit,session,ttl_blocks, signed_args).estimateGas({from: _openkey})
	
	const gasLimit = 900000
	
	console.log('Send open channel trancsaction')
	console.log('⛽ gasLimit:', gasLimit)
	
	const receipt = await this.PayChannel().methods
		.open(
			channel_id         , // random bytes32 id
			player_address     ,
			bankroller_address ,
			player_deposit     ,
			bankroller_deposit ,
			session            , // integer num/counter
			ttl_blocks         , // channel ttl in blocks count
			signed_args
		).send({
			gas      : gasLimit,
			gasPrice : 1.2 * _config.gasPrice,
			from     : _openkey,
		})
		.on('transactionHash', transactionHash=>{
			console.log('# openchannel TX pending', transactionHash)
			console.log('https://ropsten.etherscan.io/tx/'+transactionHash)
			console.log('⏳ wait receipt...')
		})
		.on('error', err=>{ 
			console.warn('Open channel error', err)
			this.response(params, { error:'cant open channel', more:err }, response_room)
		})
	
	console.log('open channel result', receipt)

	this.users[params.user_id].paychannel = {
		channel_id         : channel_id         ,
		player_deposit     : player_deposit     ,
		bankroller_deposit : bankroller_deposit ,
		session            : session            ,
	}

	if (receipt.transactionHash) {
		// Set deposit in logic
		this.users[params.user_id].logic.payChannel.setDeposit( Utils.bet2dec(player_deposit) )
	}

	this.response(params, { receipt:receipt }, response_room)
}