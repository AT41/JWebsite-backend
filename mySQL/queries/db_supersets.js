var pool = require('../connector');
var rxjsOperators = require('rxjs/operators');

var db_supersets = {};

db_supersets.getSuperset = function getSuperset(username) {
  return pool.my_db_query(
    `SELECT * from Superset WHERE SupersetOwner="global" OR SupersetOwner="${username}"`
  );
};

module.exports = db_supersets;
