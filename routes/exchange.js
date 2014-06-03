var http = require('http');
var moment = require('moment');
var mathjs = require('mathjs');

var math = mathjs();
moment().format();
var convertedAmount = 1.20;
var responseJson = { 
			'convertedAmount' :convertedAmount,
			'buyRate' :convertedAmount,
			'buy_settle_rate' : convertedAmount,
			'sellRate' :convertedAmount,
			'sell_settle_rate' : convertedAmount,
			'exchange_rate':convertedAmount,
			'settlement_time':moment(new Date()).add('m',5)
};
			
exports.exchangerate = function(req, resp){
	var params = req.params.from + '&' + req.params.to;
	var options = {
		host: 'rate-exchange.appspot.com',
		path: '/currency?from=' + req.params.from + '&to=' + req.params.to,
		method: 'GET'
	};
	var getreq = http.get(options, function(cresp){
		cresp.on('error',function(e){
			console.log("Error: " +  e.message); 
			console.log( e.stack );
		});
		cresp.on('data', function(d){
			var parsedData = JSON.parse(d);
			// convert the amount with exchange rate
			convertedAmount = math.round(req.params.amount * parsedData.rate,2) ;
			console.log(convertedAmount);
			// fill the json array
			for (var key in  responseJson){
				if (key == 'convertedAmount'){
					responseJson[key] = convertedAmount;
				}
				if (key == 'exchange_rate'){
					responseJson[key] = parsedData.rate;
				}
				if (key == 'settlement_time'){
					responseJson[key] = moment(new Date()).add('m',5);
				}
			}
			resp.send(responseJson);
		});
	});	
	getreq.on('error', function(err){
		console.log(err);
		resp.send(responseJson);
	});
	getreq.end();
};

