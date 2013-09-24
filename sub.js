var mongo = require('mongodb');
 
var server = new mongo.Server('localhost', 27017);
var db = new mongo.Db('pubsub', server);
 
db.open(function(err) {
  if (err) throw err;

  db.collection('messages', function(err, collection) {
    if (err) throw err;

    var latest = collection.find({}).sort({ $natural: -1 }).limit(1);

    latest.nextObject(function(err, doc) {
      if (err) throw err;

      var query = { _id: { $gt: doc._id }};
      
      var options = { tailable: true, awaitdata: true, numberOfRetries: -1 };
      var cursor = collection.find(query, options).sort({ $natural: 1 });

      (function next() {
        cursor.nextObject(function(err, message) {
          if (err) throw err;
          console.log(message);
          next();
        });
      })();
    });
  });
}); 