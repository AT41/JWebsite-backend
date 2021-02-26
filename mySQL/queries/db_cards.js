var pool = require('../connector');
var rxjsOperators = require('rxjs/operators');

var db_cards = {};

db_cards.getCards = function getCards(cardObject, username) {
  return pool.my_db_query(
    `SELECT * from Card
    WHERE ${Object.keys(cardObject).reduce(
      (prev, curr) =>
        prev +
        (isNaN(cardObject[curr])
          ? `INSTR(${curr}, "${cardObject[curr]}") > 0 AND `
          : `${curr}=${cardObject[curr]} AND `),
      ''
    )}
    (CardOwner="global" OR CardOwner="${username}")
    ${cardObject['SetId'] == null ? 'LIMIT 20' : ''}`
  );
};

module.exports = db_cards;
