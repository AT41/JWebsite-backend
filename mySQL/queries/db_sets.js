var pool = require('../connector');
var rxjsOperators = require('rxjs/operators');

var db_sets = {};

db_sets.getSets = function getSets(supersetIdNumber, username) {
  return pool.my_db_query(
    `SELECT * from japanese.Set WHERE SupersetId=${supersetIdNumber} AND SetOwner="global" OR SetOwner="${username}"`
  );
};

module.exports = db_sets;
