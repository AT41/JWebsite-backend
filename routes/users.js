var express = require('express');
var router = express.Router();
var db_users = require('../mySQL/queries/db_users');
var firebase_auth = require('../shared/firebase-auth');

router.get('/search_user', function(req, res, next) {
  const idToken = req.query['idToken'];
  firebase_auth.verifyIdToken(idToken).then(
    username => {
      db_users.getUsers(username).subscribe(val => res.json(val))
    }
  ).catch(rej => {
    res(null);
  })
});

router.get('/add_user', function(req, res, next) {
  const idToken = req.query['idToken'];
  firebase_auth.verifyIdToken(idToken).then(
    username => {
      db_users.addUser(username).subscribe(val => res.json(val));
    }
  ).catch(rej => {
    res(null);
  })
});

module.exports = router;
