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

  next();
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/