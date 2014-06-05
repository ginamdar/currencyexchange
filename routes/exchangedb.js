exports.add = function(req, res, next){
	if (req.rate && req.rate.name){
		console.log('Add: No record inserted');
		res.send(JSON.stringify(req.rate));
	}else{
	if (!req.body || !req.body.name) return next(new Error('No data provided.'));
	
		req.db.rates.save({
			name: req.body.name,
			rate: req.body.exchange_rate,
			settlement_time: req.body.settlement_time,
			from: req.body.from,
			to: req.body.to,
			rejected: req.body.rejected
		}, function(error, rate){
			if (error) return next(error);
			if (!rate) return next(new Error('Failed to save.'));
			console.info('Added %s with id=%s', rate.name, rate._id);    
			res.send(JSON.stringify(rate));
	  })
  }
};

exports.listAll = function(req, resp, next){
	req.db.rates.find().toArray(function(error, customers){
		if (error) return next(error);
		console.info('Total Records Found: ' + customers.length);
		resp.send(JSON.stringify(customers));
	});
};