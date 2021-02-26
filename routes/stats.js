/**
 * Route for stats
 */

var express = require('express');
var router = express.Router();
var db_stats = require('../mySQL/queries/db_stats');
var RxOperators = require('rxjs/operators');
var Rx = require('rxjs');

router.get('/get_stats', function(req, res, next) {
    const statOwner = req.query.statOwner;
    const cardId = req.query.cardId;
    db_stats.getStats(statOwner, cardId).subscribe(val => res.json(val));
});

router.get('/increment_stats', function(req, res, next) {
    const statOwner = req.query.statOwner;
    const cardId = req.query.cardId;
    const isCorrect = req.query.isCorrect;
    return incrementStats(isCorrect, statOwner, cardId).pipe(
        RxOperators.switchMap(
            val => val['affectedRows'] === 0 ? createStats(isCorrect, statOwner, cardId) : Rx.of(val)
    )).subscribe(val => res.json(val));
});

function createStats(isCorrect, statOwner, cardId) {
    return db_stats.createStats(statOwner, cardId, isCorrect === 'true' ? 1 : 0, isCorrect === 'false' ? 1 : 0);
};

function incrementStats(isCorrect, statOwner, cardId) {
    return db_stats.incrementStats(isCorrect, statOwner, cardId);
};

module.exports = router;