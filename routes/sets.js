/**
 * Route for getting sets
 */

var express = require('express');
var router = express.Router();
var db_sets= require('../mySQL/queries/db_sets');

// TODO Username must also match the owner of each 
// set or set owner must equal 'global'
router.get('/', function(req, res, next) {
    const supersetId = req.query.supersetId;
    const username = req.query.username;
    db_sets.getSets(supersetId, username).subscribe(val => res.json(val));
});

module.exports = router;