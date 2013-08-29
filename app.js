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
    

//INITIATE MARKETS
var markets = ['SimBEAN', 'SimGRAIN', 'SimMEAT'];
var allData = [];
markets.forEach(function(market){allData.push({});});

//SOCKET SETUP
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
io.set('log level', 0);
var activeClients = 0;

io.sockets.on('connection', function(socket){
  clientConnect(socket);

  //Initiating socket messages to listen for  
  socket.on('sendTrade', function(data){
    var response = {};
    response.ok = "Trade received by system";
    submitOrder(data);
    socket.emit('trade_response', {data: response});
    io.sockets.emit('completeData', {market: allData});
  });

  //FUTURE MESSAGES to listen to
  // TODO CODES
  // TODO CODES

});




function clientConnect(socket){
  activeClients += 1;
    io.sockets.emit('clientcon', {clients:activeClients});
    io.sockets.emit('completeData', {market: allData});
  socket.on('disconnect', function(){clientDisconnect()});
}

function clientDisconnect(){
  activeClients -= 1;
  io.sockets.emit('clientcon',{data: exchangeData, clients:activeClients});
}


//SUBMIT RANDOM TRADES
//Setup markets with buys and sellse
for(var i=0; i < 300; i++){
  for(var j=0; j<markets.length; j++){
    initiateOrder(j, false);
  }
}

//Start generating random orders to bring the market to life



function submitOrder(data){
  var d = data.message;
  var exchangeData = allData[d.ind];
  exchangeData.market = markets[d.ind];

  if(d.tradetype=="BUY"){
    var ttype = "buys";
   allData[d.ind] = exch.buy(d.price, d.contracts, exchangeData);
  } else{
    var ttype = "sells";
    allData[d.ind] = exch.sell(d.price, d.contracts, exchangeData);
  }

    if(exchangeData.trades && exchangeData.trades.length > 0){
      var trades = exchangeData.trades.map(function(trade){
        trade.init = (ttype == exch.BUY) ? 'b' : 's';
        trade.market = markets[d.ind];
        return trade;
      });
      io.sockets.emit('trade', exchangeData.trades);
      //Insert into database
      goose.insert('transactions', trades, function(err, trades){
        //tradelib.sendTrades(exchangeData.trades);
       //pauseThenTrade();
      });
    }
}

function initiateOrder(index, dopause) {
  var exchangeData = allData[index];
 
  var ord = tradelib.generateRandomOrder(exchangeData);
  console.log(ord);
  exchangeData.market = markets[index];
  
  if(ord.type == exch.BUY)
    allData[index] = exch.buy(ord.price, ord.volume, exchangeData);
  else
    allData[index] = exch.sell(ord.price, ord.volume, exchangeData);
  
    if(exchangeData.trades && exchangeData.trades.length > 0){
      var trades = exchangeData.trades.map(function(trade){
        trade.init = (ord.type == exch.BUY) ? 'b' : 's';
        trade.market = markets[index];
        return trade;
      });
      io.sockets.emit('trade', exchangeData.trades);
      
     

     goose.insert('transactions', trades, function(err, trades){
        //tradelib.sendTrades(exchangeData.trades);
       //pauseThenTrade();
     });

    }
    if(dopause==true){
     var pause = Math.floor(Math.random()*timeRange)+timeFloor;
     setTimeout(initiateOrder.bind(this, index).bind(dopause,true), pause);}
  io.sockets.emit('completeData', {market: allData});
}




for(var i=0; i < markets.length; i++){
   initiateOrder(i, false);
}



// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(express.session({secret: 'secretpassword', store:tradelib.getSessionStore()}));
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

app.get('/', routes.index);

app.get('/charts', function(req,res){
  console.log("chart page");
  console.log(markets);

  
  res.render('charts', { title: 'TradeMachine', locals: {data: markets}});
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

app.listen(5000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
