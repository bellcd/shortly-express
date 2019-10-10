const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  if (req.skipAuth) {
    next();
  } else {
    console.log('CREATE SESSION')
  // const randomNum = hashUtils.createRandom32String();
  // const hash = hashUtils.createHash(randomNum) // TODO: add salt??

  // do we need to add data about this session, if found, to the req object
  // that data is used in the conditinal logic in the /login route

  // how to get to ID from the users table, immediately upon creating a new hash
  // LAST INSERT ID ??
  // ie, how do we keep them linked without foreign keys?

  // generate and store a unique hash in the sessions table of the db
  models.Sessions.create()
    .then((result) => {
      // set that hash as a cookie in the response
      //models.Sessions.getLastHash()
      res.set({
        'Set-Cookie': `cookie=${result.hash}`
      });
      next();
    })
    .catch((err) => {
      res.status(400).send();
    })
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/