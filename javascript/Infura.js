function Infura(openkey) {
	PIXI.Container.call( this );
	
	var _self = this;
	var _urlInfura = "https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl";
	
	/*_self.sendRequest = function(name, params, callback){
		if(openkey){
			var method = name;
			var arParams = [params, "latest"]; // latest, pending
			
			switch(name){
				case "updateChannel":
				case "updateGame":
				case "openDispute":
					method = "eth_getTransactionCount";
					break;
				case "gameTxHash":
				case "sendRaw":
					method = "eth_sendRawTransaction";
					arParams = [params];
					break;
				default:
					method = "eth_call";
					break;
			}
			
			$.ajax({
				url: _urlInfura,
				type: "POST",
				async: false,
				dataType: 'json',
				data: JSON.stringify({"jsonrpc":'2.0',
										"method":method,
										"params":arParams,
										"id":1}),
				success: function (d) {
					callback(name, d.result, d.error);
				},
				error: function(jQXHR, textStatus, errorThrown)
				{
					console.log("An error occurred whilst trying to contact the server: " + 
							jQXHR.status + " " + textStatus + " " + errorThrown);
				}
			})
		}
	}*/
	
	return _self;
}