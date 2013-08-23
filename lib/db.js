var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

// Connect to cloud database
var username = "admin";
var password = "admin";
var address = '@ds041248.mongolab.com:41248/nockmarket';
connect();

// Connect to mongo
function connect() {
	var url = 'mongodb://' + username + ':' + password + address;
	if(mongoose.connect(url)){
	console.log("Connected to MongoLab");}
}

Trade = new Schema({
	any: Schema.Types.Mixed
});



module.exports = {

	find: function(collec, callback){
		mongoose.connection.db.collection(collec, function (err, collection) {
		var c = collection.find({"0": {$exists: true}}).toArray(callback);
		});
	},
	insert: function(model, items, callback){
		var Trans = mongoose.model(model, Trade);
		var trade = new Trans(items);
		trade.save(function(err, data){
			if(err){
				console.log(err);
				//res.json(err);
			}
			else {
				console.log(data);
				//res.json(data);
			}
		});
		
		
		/*db.collection(name).insert(items, callback);*/
	},
	
	open: function(callback){
		
			
		
		
	},
	test: function(message){
		console.log(message);
	}
}

function disconnect() {mongoose.disconnect()}