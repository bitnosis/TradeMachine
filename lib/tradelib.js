'use strict';

var exchange = require('./exchange'),
	priceFloor = 35,
	priceRange = 10,
	volFloor = 10,
	volRange = 8;

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
	}
}