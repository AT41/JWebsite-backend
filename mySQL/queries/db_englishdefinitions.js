var pool = require('../connector');
var rxjsOperators = require('rxjs/operators');

var db_englishdefinitions = {};

db_englishdefinitions.getEnglishDefinitions = function getEnglishDefinitions(definition, username) {
  return pool.my_db_query(
    `SELECT Definition from EnglishDefinition
    WHERE Owner="global" AND INSTR(Definition, "${definition}")=1 LIMIT 20`
  );
};

db_englishdefinitions.getCardIdDefinition = function getCardIdDefinition(cardIds) {
  return pool.my_db_query(
    `SELECT Definition, CardId from EnglishDefinition 
    WHERE Owner="global" AND CardId IN (${cardIds}) ORDER BY CardId ASC`
  );
};

module.exports = db_englishdefinitions;
