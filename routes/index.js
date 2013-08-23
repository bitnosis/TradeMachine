
/*
 * GET home page.
 */

exports.index = function(req, res){
  var asks = {};
  var bids = {};

  res.render('index', { title: 'BitTrade', locals: {data: {'last': "test", asks:asks, bids:bids} }})
};