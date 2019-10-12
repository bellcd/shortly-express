const models = require('../models');

const parseCookies = (req, res, next) => {
  req.needLogin = true;
  req.needSignUp = false;
  req.skipAuth = true;

  // cookes property on req object might have the sessions hash, if this is from a redirected request
  // look at req.sessionHash
  undefined || 'string'


  if (typeof req.sessionHash === 'string') {
    // already a string on req.sessionHash, SKIP auth middleware
    next();
  } else if (req.headers.cookie === undefined) {
    // NO
      // go to next middleware (auth)
      req.skipAuth = false;
      next();
  } else {
    const cookies = req.headers.cookie;
    const cookiesArr = cookies.split('=');
    const value = cookiesArr[1];

    if (value) {
      models.Sessions.get({ hash: value })
        .then((result) => {
          if (result === undefined) {
            // else cookie is invalid
            // run auth middleware (create cookie and set it)
            req.skipAuth = false;
            next();
          } else if (result.userId !== null) {
            // check if cookie is valid (exists in sessions table) AND userId is an integer
            // user can skip login screen
            req.needLogin = false;
            next();
          } else {
            // check if cookie is valid (exists in sessions table) AND userId is NULL
            // redirect to to sign up page
            req.needSignUp = true;
            next();
          }
        })
        .catch((err) => {
          console.log('err: ', err); // TODO: handle err
        })
    }
  }
};

module.exports = parseCookies;