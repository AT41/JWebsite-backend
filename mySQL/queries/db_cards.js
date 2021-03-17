var pool = require('../connector');
var rxjsOperators = require('rxjs/operators');

var db_cards = {};

db_cards.getCards = function getCards(setIds, cardObject, username) {
  var setRanges = [], setRangeStart = -1;
  setIds.forEach((setId, index) => {
    if (setRangeStart === -1) {
      setRangeStart = setId;
    }
    if (index === setIds.length - 1 || setIds[index + 1] - 1 !== setId) {
      setRanges.push({start: setRangeStart, end: setId})
      setRangeStart = -1;
    }
  });
  
  setRanges = setRanges.map(setRange => `(SetId>=${setRange.start} AND SetId<=${setRange.end})`).join(' OR ');

  return pool.my_db_query(
    `SELECT * from Card WHERE 
      ${setRanges} AND 
      (CardOwner="global" ${username ? `OR CardOwner="${username}"` : ''})
      ORDER BY RAND()
      ${'LIMIT ' + (cardObject['numberOfQuestions'] ? cardObject['numberOfQuestions'] : '20')}`
  );
};

db_cards.getCardCount = function getCardCount(setIds, username) {
  return pool.my_db_query(`SELECT COUNT(*) as count from CARD WHERE 
    (CardOwner="global" OR CardOwner="${username}") AND 
    (${setIds.map(id => `SetId=${id}`).join(' OR ')})
  `);
}

module.exports = db_cards;
