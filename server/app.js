const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const cookieParser = require('./middleware/cookieParser.js');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser);
app.use(Auth.createSession);

app.get('/', Auth.verifySession,
(req, res) => {
  console.log('inside GET /');
  console.log('req.originalUrl: ', req.originalUrl);
  res.render('index');
});

app.get('/create', (req, res) => {
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login', (req, res, next) => {
    console.log('inside GET /login');
    console.log('req.originalUrl: ', req.originalUrl);
    // console.log('req: ', req);
  res.render('login');
});

app.post('/login', (req, res, next) => {
  // res.render('login');
  // query the data base for the username record, to get the hashed password and salt
  models.Users.get({ username: req.body.username })
    .then((record) => {
      // TODO: handle case where username doesn't exist yet
      if (!record) {
        res.redirect('/signup');
      } else {
        // call compare fn with user provided password, hashed password from db, and salt
        const match = models.Users.compare(req.body.password, record.password, record.salt);
        console.log('match: ', match);
        // if passwords match,
        if (match) {
          // set new cookie of sessionHash
          res.set({
            'Set-Cookie': `cookie=${req.sessionHash}`
          });

          // store created sessionHash in db
          // find the record in the session table where userId matches relevant user
          models.Users.get({ username: req.body.username})
            .then((user) => {
              // update that record's hash field with sessionHash
              return models.Sessions.update({ userId: user.id }, { hash: req.sessionHash });
            })
            .then(() => {
              // display index page
              res.redirect('/');
            })
            .catch((err) => {
              throw err;
            })
        } else {
          // display login page with try again message
          res.render('login-err');
        }
      }
    })
    .catch((err) => {
      throw err;
    });
});

app.get('/signup', (req, res, next) => {
  res.render('signup');
});

app.post('/signup', (req, res, next) => {
  const user = models.Users.create({
    username: req.body.username,
    password: req.body.password
  });

  user
    .then(() => {
      return models.Users.get({username: req.body.username})
    })
    .then((user) => {
      return models.Sessions.create(req.sessionHash, user.id);
    })
    .then(() => {
      res.set({
        'Set-Cookie': `cookie=${req.sessionHash}`
      });
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send();
    });
});

app.get('/logout', (req, res, next) => {
  res.clearCookie('cookie');
  res.redirect('/login');
})
/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
