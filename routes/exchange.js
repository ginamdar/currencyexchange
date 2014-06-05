var http = require('http');
var mathjs = require('mathjs');
var moment =  require('moment');
var math = mathjs();
moment();
var convertedAmount = 1.20;
var responseJson = { 
			'name' : 'TEST',
			'convertedAmount' :convertedAmount,
			'buyRate' :convertedAmount,
			'buy_settle_rate' : convertedAmount,
			'sellRate' :convertedAmount,
			'sell_settle_rate' : convertedAmount,
			'exchange_rate':convertedAmount,
			'settlement_time':new Date()
};
			
exports.exchangerate = function(req, resp, next){
	if (req.rate) return next();
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
				if (key == 'name'){
					responseJson[key] = req.params.customer_id
				}
				if (key == 'convertedAmount'){
					responseJson[key] = convertedAmount;
				}
				if (key == 'exchange_rate'){
					responseJson[key] = parsedData.rate;
				}
				if (key == 'settlement_time'){
					var now = new Date();
					responseJson[key] = now.setMinutes(now.getMinutes() + 5);
				}
			}
			req.body.name=responseJson['name'];
			req.body.exchange_rate=responseJson['exchange_rate'];
			req.body.settlement_time=responseJson['settlement_time'];
			console.log("req.body.settlement_time :" + req.body.settlement_time + "formatter:" + 
					moment(req.body.settlement_time).format('YYYY:MM:DD HH:mm:ss:SS'));
			req.body.from = req.params.from;
			req.body.to = req.params.to;
			req.body.rejected = false;
			return next();
		});
	});	
	getreq.on('error', function(err){
		console.log(err);
		resp.send(responseJson);
		req.body=responseJson;
		return next(new Error('exchange rate not found.'));
	});
	getreq.end();
};

