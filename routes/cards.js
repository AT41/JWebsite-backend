/**
 * Route for getting sets
 */

var express = require('express');
var router = express.Router();
var db_cards = require('../mySQL/queries/db_cards');

// TODO Username must also match the owner of each
// card
router.get('/cards', function(req, res, next) {
  const username = req.query['username'];
  delete req.query['username'];
  const sessionToken = req.query['session_token'];
  delete req.query['session_token'];

  Object.keys(req.query).forEach((key) => {
    if (req.query[key] == null || req.query[key] == '') {
      delete req.query[key];
    }
  });

  db_cards.getCards(req.query).subscribe((val) => res.json(val));
});

module.exports = router;
