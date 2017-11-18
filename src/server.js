import _ from 'lodash';
import bodyParser from 'body-parser';
import bytes from 'bytes';
import cookieParser from 'cookie-parser';
import connectBusboy from 'connect-busboy';
import connectMongodb from 'connect-mongo';
import express from 'express';
import ejsMate from 'ejs-mate';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import favicon from 'serve-favicon';
import logger from 'morgan';
import multiline from 'multiline';
import useragent from 'express-useragent';

import config from './config';
import pageRouter from './pageRouter';
import dataRouter from './dataRouter';
import markdown from './common/markdown';
import { authUser } from './middlewares/auth';
import { zoneRequired, zonesRequired } from './middlewares/zone';
import errorHandler from './middlewares/errorHandler';
import page404 from './middlewares/404';
import db from './models/index';

const debug = require('debug')('community:app');
const GitHubStrategy = require('passport-github').Strategy;
const MongoStore = new connectMongodb(session);
const app = express();

app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', ejsMate);
app.locals._layoutFile = 'layout.html';

app.locals = Object.assign(app.locals, {
  _,
  config: config,
  apiPrefix: config.apiPrefix,
  markdown,
  multiline,
  signupValid: config.signupValid,
  signinValid: config.signinValid,
  githubSigninValid: config.github.signinValid
});

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.sessionSecret));
app.use(useragent.express());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'upload')));
app.use(
  session({
    secret: config.sessionSecret,
    store: new MongoStore({
      url: config.mongodb.url
    }),
    resave: true,
    saveUninitialized: true
  })
);

app.use(
  connectBusboy({
    limits: {
      fileSize: bytes(config.fileLimit)
    }
  })
);

app.use(passport.initialize());
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(
  new GitHubStrategy(config.github, function(
    accessToken,
    refreshToken,
    profile,
    done
  ) {
    profile.accessToken = accessToken;
    done(null, profile);
  })
);

app.use(authUser);
app.use(zoneRequired);
app.use(zonesRequired);

app.use((req, res, next) => {
  app.locals.isMobile = req.useragent.isMobile;
  res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
  next();
});

app.use(config.apiPrefix.page, pageRouter);
app.use(config.apiPrefix.data, dataRouter);
app.use(page404);
app.use(errorHandler);

db().then(() => {
    require('./init');
    app.listen(config.port, () => {
      debug(`The server is running at http://localhost:${config.port}/`);
    });
  })
  .catch(err => {
    debug(err);
  });

module.exports = app;
