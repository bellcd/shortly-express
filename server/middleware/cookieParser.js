const models = require('../models');

const parseCookies = (req, res, next) => {
  // console.log('req.headers.cookies: ', req.headers.cookies);
  // console.log('req: ', req);

  // cookes property on req object might have the sessions hash, if this is from a redirected request
  // look at req.sessionHash
  if (req.sessionHash !== undefined) {
    // if NOT undefined, SKIP auth middleware
    req.skipAuth = true;
    next();
  } else if (req.headers.cookie === undefined) {
    // NO
      // go to next middleware (auth)
      next();
  } else {
    console.log('req.headers: ', req.headers);
    const cookies = req.headers.cookie;
    const cookiesArr = cookies.split('=');
    const value = cookiesArr[1];
    console.log('value: ', value);
    // else check to see if req has a cookie
    if (value) {
      // YES, check if cookie is valid (exists in sessions table) AND userId is an integer
      models.Sessions.get({ hash: value })
        .then((result) => {
          console.log('result: ', result);
          next();
        })
        .catch((err) => {
          console.log('err: ', err); // TODO: handle err
        })
      // if (cookie is a valid hash) {
      //   // YES, let em in
      // }  else (cookie is invalid, userId is NULL) {
      //   // else cookie is valid, userId is NULL
      //     // they see create user, screen don't run auth middleware
      // } else {
      //   // else cookie is invalid
      //     // run auth middleware (create cookie and set it)
      // }
    }
  }
};

module.exports = parseCookies;