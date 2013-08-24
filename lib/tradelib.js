'use strict';

var exchange = require('./exchange'),
	express = require('express'),
	MemoryStore = express.session.MemoryStore,
	cookie = require('cookie'),
	crypto = require('crypto'),
	priceFloor = 35,
	priceRange = 10,
	volFloor = 10,
	volRange = 8;

var sessionStore = new MemoryStore();
var io;



module.exports = {
	generateRandomOrder : function(exDat) {
		var order = {};
		if(Math.random() > 0.5) order.type = exchange.BUY
		else order.type = exchange.SELL

		var buyExists = exDat.buys && exDat.buys.prices.peek();
		var sellExists = exDat.sells && exDat.sells.prices.peek();
		var ran = Math.random();

		if (!buyExists && !sellExists) {
			order.price = (Math.round((Math.floor(ran * priceRange) + priceFloor)*4)/4);
		} 
		else if (buyExists && sellExists) {
			if (Math.random() > 0.5)
				order.price = exDat.buys.prices.peek();
			else
				order.price = exDat.sells.prices.peek();
		} 
		else if (buyExists) {
			order.price = exDat.buys.prices.peek();
		} 
		else {
			order.price = exDat.sells.prices.peek();
		}

		var shift = Math.floor(Math.random() * priceRange / 2);

		if (Math.random() > 0.5) order.price += shift;
		else order.price -= shift;
		order.volume = Math.floor(Math.random() * volRange) + volFloor;
		return order;
	},
	getSessionStore: function(){
		return sessionStore;
	},

	createSocket: function(app){
		io = require('socket.io').listen(app);
		io.configure(function(){
			io.set('authorization', function(handshakeData, callback){
				if(handshakeData.headers.cookie){
					handshakeData.cookie = cookie.parse(decodeURIComponent(handshakeData.headers.cookie));
					handshakeData.sessionID = handshakeData.cookie['connect.sid'];
					sessionStore.get(handshakeData.sessionID, function(err, session){
						if(err || !session){
							return callback(null, false);
						} else {
							handshakeData.session = session;
							console.log('session data', session);
							return callback(null, true);
						}
					})
				}
				else {
					return callback(null, false);
				}
			});
		});
	},
	sendTrades: function(trades){
		io = require('socket.io').listen(app);
		io.sockets.emit('trade', JSON.stringify(trades));
	},
	sendExchangeData: function(stock, exchangeData){
		lastExchangeData[stock] = exchangeData;
		var current = transformStockData(stock, exchangeData);
		io.sockets.emit('exchangeData', current);
	},



}
	



function transformExchangedData(data){
	var transformed = [];
		for (var stock in data) {
		var existingData = data[stock];
		var newData = transformStockData(stock, existingData);
		transformed.push(newData);
		}
	return transformed;
}

function transformStockData(stock, existingData){
	var newData = {};
	newData.st = stock;
	if(existingData && existingData.trades && existingData.trades.length >0){
		newData.tp = existingData.trades[0].price;
		newData.tv = existingData.trades[0].volume;
	}
}

