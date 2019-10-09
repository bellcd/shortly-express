const parseCookies = (req, res, next) => {
  // console.log('req.headers.cookies: ', req.headers.cookies);
  // console.log('req: ', req);

  // check to see if req has a cookie
    // YES
      // parse cookie
        // check if cookie is valid (exists in sessions table)
          // YES, ??
          // NO, ??
    // NO
      // go to next middleware (auth)
  next();
};

module.exports = parseCookies;