var express = require('express');
var router = express.Router();
var db_englishdefinitions = require('../mySQL/queries/db_englishdefinitions');

router.get('/search_definition', function(req, res, next) {
  const username = req.query['username'];
  const definition = req.query['definition'];

  db_englishdefinitions.getEnglishDefinitions(definition).subscribe((val) => res.json(val));
});

router.get('/match_card_ids', function(req, res, next) {
  const username = req.query['cardIds'];
  const cardIds = req.query['cardIds'];

  db_englishdefinitions.getCardIdDefinition(cardIds).subscribe((val) => res.json(val));
});

module.exports = router;
