const fs = require('fs');

const fileName = './logs/';

function toReadableDate(d) {
  return `${d.getDate()}.${d.getMonth()}.${d.getYear() + 1900}`;
}

function getCurrentTime(d) {
  return `${(d.getUTCHours() + 18) % 24}h, ${d.getUTCMinutes()}min, ${d.getUTCSeconds()}s`;
}

var logger = {};
logger.log = function(text) {
  console.log(text);
  try {
    var d = new Date();
    fs.appendFile(
      fileName + toReadableDate(d) + ' log.txt',
      `${getCurrentTime(d)}: ${text}\n`,
      () => {}
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = logger;
