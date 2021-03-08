var mysql = require('mysql2');
var rxjs = require('rxjs');
// ASK ANTHONY FOR THIS FILE, CONTAINS SENSITIVE INFO TO LOG INTO DATABASE
var config = require('./config');

// Maintains a list of connections that are shared between threads.
// If all connections are being used by a user then new connections will be created/destroyed.
var flashcardsPool = mysql.createPool(config);

var pool = {};

// Function that takes in a query string and a res
pool.my_db_query = function(myQuery) {
  return rxjs.Observable.create(function(observer) {
    var pool = flashcardsPool;

    pool.getConnection(function(err, connection) {
      if (err) {
        observer.next('ERROR', err);
        observer.complete();
      } else {
        connection.query(myQuery, function(error, results, fields) {
          if (error) {
            console.log('ERROR', error);
          }
          // TODO Error checking
          observer.next(results);
          observer.complete();
          connection.release();
        });
      }
    });
  });
};
pool.disconnect = function() {
  if (type === connectorType.FLASHCARDS) {
    flashcardsPool.end();
  }
};

module.exports = pool;
