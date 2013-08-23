/**
 * Module dependencies.
 */

 'use strict';

var express = require('express'),
    routes = require('./routes'),
    fs = require('fs'),
    exchangeData = {},
    exch = require('./lib/exchange'),
    tradelib = require('./lib/tradelib'),
    goose = require('./lib/db'),
    timeFloor = 100,
    timeRange = 1000;



submitRandomOrder();

function submitRandomOrder() {
  //order
  var ord = tradelib.generateRandomOrder(exchangeData);
  console.log('order', ord);
  if(ord.type == exch.BUY)
    exchangeData = exch.buy(ord.price, ord.volume, exchangeData);
  else
    exchangeData = exch.sell(ord.price, ord.volume, exchangeData);
  
    if(exchangeData.trades && exchangeData.trades.length > 0){
      var trades = exchangeData.trades.map(function(trade){
        trade.init = (ord.type == exch.BUY) ? 'b' : 's';
        return trade;
      });


      goose.insert('transactions', trades, function(err, trades){
        
      });
    }
    
    var pause = Math.floor(Math.random()*timeRange)+timeFloor;
    setTimeout(submitRandomOrder, pause);
    console.log(exch.getDisplay(exchangeData));
  

  }


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.set('view options', {
layout: false
});

app.get('/', function(req,res){
  console.log("chart page");
  res.render('charts');
});

app.get('/api/trade', function(req,res){
goose.find('transactions', function(err, trades){
  if(err){
    console.error(err);
    return;
  }


  var json = [];
  var lastTime = 0;
  console.log(trades.reverse());
  trades.reverse().forEach(function(trade){
    var date = new Date(parseInt(trade._id.toString().substring(0,8), 16)*1000);
    var dataPoint = [date.getTime(), trade[0].price];
    if(date - lastTime > 1000){
      json.push(dataPoint);
      lastTime = date;
    }
   
   
  });

res.json(json);

 
});

});



app.get('/form', function(req, res) {
	fs.readFile('./form.html', function(error, content) {
		if (error) {
			res.writeHead(500);
			res.end();
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(content, 'utf-8');
		}
	});
});

app.post('/signup', function(req, res) {
  console.log("test");
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
