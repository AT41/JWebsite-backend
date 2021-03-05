var admin = require('firebase-admin');
var firebaseAuth = {};

admin.initializeApp({
  credential: admin.credential.cert('firebase-auth.json')
});

firebaseAuth.verifyIdToken = function verifyIdToken(idToken) {
    return new Promise((res, rej) => {
      admin
        .auth()
        .verifyIdToken(idToken).then((decodedToken) => {
          res(decodedToken.email);
        })
        .catch((error) => {
          // Handle error
          console.log(error);
          rej(false);
        });
      });
}

module.exports = firebaseAuth;