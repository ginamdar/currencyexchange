var express = require('express');
var http = require('http');
var path = require('path');
var session = require('express-session');
var csrf = require('csrf');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var routes = require('./routes/index');
var users = require('./routes/users');
var exchangeDB = require('./routes/exchangedb');
var exchange = require('./routes/exchange');
var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/xchange?auto_reconnect', {safe:true});
var app = express();
app.use(function(req, res, next) {
  req.db = {};
  req.db.rates = db.collection('rates');
  next();
})
// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));
app.use(csrf());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, resp, next){
	resp.locals._csrf = req.session._csrf;
	return next();
});

app.use('/', routes);
app.use('/users', users);
// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.param('customer_id', function(req, res, next, customerId) {
	console.log("Middleware customerId called " + customerId);  
	req.db.rates.find({
		//settlement_time: { $lt: new Date()},
		name:customerId
	}).toArray(function(error, customers){
		if (error) return next(error);
		console.info('Total Records Found: ' + customers.length);
		for (var i = 0; i < customers.length; i++){
			console.log("aCustomer:" + customers[i].name +  ' |From:' + customers[i].from + ' |To:' + 
				customers[i].to + ' |Rate:' +  customers[i].rate + '|settlement_time:' + customers[i].settlement_time);
		}
		req.customers = customers || [];
	});
	return next();
});

app.param('id', function(req, resp, next, id){
	console.log("Middleware id called " + id);
	req.db.rates.findById(id, function(error, rate){
		if (error) return next(error);
		if (!rate) return next(new Error('rate not found.'));
		req.rate = rate;
		console.log("RATE found: " + req.rate.name);
		return next();
  });
});

var findRateAndSave = [exchange.exchangerate, exchangeDB.add];
app.get('/currencyexchange/listall', exchangeDB.listAll);
app.get('/currencyexchange/:from/:to/:amount/:customer_id', findRateAndSave);
app.get('/currencyexchange/:id', findRateAndSave);


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.all('*', function(req, res){
  res.send(404);
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
