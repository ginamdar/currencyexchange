exports.add = function(req, res, next){
	if (!req.body || !req.body.name) return next(new Error('No data provided.'));
	req.db.rates.save({
		name: req.body.name,
		rate: req.body.exchange_rate,
		settlement_time: req.body.settlement_time,
		from: req.body.from,
		to: req.body.to,
		rejected: req.body.rejected
	}, function(error, coversionrate){
		if (error) return next(error);
		if (!coversionrate) return next(new Error('Failed to save.'));
		console.info('Added %s with id=%s', coversionrate.name, coversionrate._id);    
		res.send(JSON.stringify(req.body));
  })
};