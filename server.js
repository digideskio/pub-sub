var express = require('express'),
    http    = require('http'),
    mongodb = require('mongodb');

var app = express();
app.configure(function () {
    app.set('port', 8000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
});
 
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8000);

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
            io.sockets.emit('new_mail_rcv', message );
          next();
        });
      })();
    });
  });
}); 


io.sockets.on('connection', function (socket) {

  socket.on('send_new_mail', function (data) {
    console.log( data );
    db.collection('messages', function(err, collection) {
      collection.insert( data );
    });
  });

  socket.on('get_all_mail', function (data) {
    db.collection('messages', function(err, collection) {
      collection.find().toArray(function(error, results) {
        socket.emit('get_all_mail_ans', results);
      });
    });
  });
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

