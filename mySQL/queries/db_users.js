var pool = require('../connector');

var db_users = {};

db_users.getUsers = function getUsers(username) {
  return pool.my_db_query(`SELECT * from User WHERE Id='${username}'`);
};

db_users.addUser = function addUser(username) {
  return pool.my_db_query(`INSERT IGNORE INTO User VALUES ('${username}')`);
}

module.exports = db_users;
