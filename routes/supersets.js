/**
 * Route for getting supersets
 */

var express = require('express');
var router = express.Router();
var db_supersets = require('../mySQL/queries/db_supersets');

// TODO ANTHONY Add security to check for valid login before getting supersets and sets
router.get('/', function(req, res, next) {
  db_supersets.getSuperset(req.query.username).subscribe((val) => res.json(val));
});

module.exports = router;
