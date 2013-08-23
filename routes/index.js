
/*
 * GET home page.
 */
modules.exports = {

	index: function(req, res){
		var asks = {};
  		var bids = {};
		res.render('index', { title: 'TradeMachine', locals: {data: {'last': "test", asks:asks, bids:bids} }})
	};
}
