const models = require('../models');
const Promise = require('bluebird');
const utils = require('../lib/hashUtils')

module.exports.createSession = (req, res, next) => {
  if (req.skipAuth) {
    next();
  } else {
  // const randomNum = hashUtils.createRandom32String();
  // const hash = hashUtils.createHash(randomNum) // TODO: add salt??

  // do we need to add data about this session, if found, to the req object
  // that data is used in the conditinal logic in the /login route

  // how to get to ID from the users table, immediately upon creating a new hash
  // LAST INSERT ID ??
  // ie, how do we keep them linked without foreign keys?

  // generate and store a unique hash in the sessions table of the db
  let data = utils.createRandom32String();
  let hash = utils.createHash(data);
  req.sessionHash = hash

  // req.session.hash = hash;// TODO: verify req.session, and how it's used
  next();
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

// decide if certain incoming requests are allowed to skip the login screen, and go directly to app functionality
module.exports.verifySession = function(req, res, next) {
console.log('req.needSignUp: ', req.needSignUp);
console.log('req.needLogin: ', req.needLogin);

  if (req.needSignUp) {
    res.redirect('/signup');
  } else if (req.needLogin) {
    res.redirect('/login');
  } else {
    next();
  }
};