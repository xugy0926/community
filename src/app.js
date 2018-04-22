import bodyParser from 'body-parser';
import bytes from 'bytes';
import cookieParser from 'cookie-parser';
import connectBusboy from 'connect-busboy';
import connectMongodb from 'connect-mongo';
import express from 'express';
import ejsMate from 'ejs-mate';
import expressGraphQL from 'express-graphql';
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
import marked from './common/marked';
import { authUser } from './middlewares/auth';
import zone from './middlewares/zone';
import githubAuth from './middlewares/githubAuth';
import errorHandler from './middlewares/errorHandler';
import page404 from './middlewares/404';
import initDB from './data/index';
import * as db from './data/db';
import schema from './data/schema';

const debug = require('debug')('community:app');
const MongoStore = new connectMongodb(session);
const app = express();

app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', ejsMate);
app.locals._layoutFile = 'layout.html';

app.locals = Object.assign(app.locals, {
  config: config,
  apiPrefix: config.apiPrefix,
  marked,
  multiline,
  signupValid: config.signupValid,
  signinValid: config.signinValid,
  githubSigninValid: config.github.signinValid
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.sessionSecret));
app.use(useragent.express());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'upload')));

app.use(
  connectBusboy({
    limits: {
      fileSize: bytes(config.fileLimit)
    }
  })
);

app.use(githubAuth());
app.use(authUser);
app.use(zone);

app.use(
  '/graphql',
  expressGraphQL(req => ({
    schema,
    graphiql: true,
    rootValue: { req },
    context: {
      db
    },
    pretty: true
  }))
);

app.use(config.apiPrefix.page, pageRouter);
app.use(config.apiPrefix.data, dataRouter);
app.use(page404);
app.use(errorHandler);

initDB()
  .then(() => {
    require('./data/init');
    app.listen(config.port, () => {
      debug(`The server is running at http://localhost:${config.port}/`);
    });
  })
  .catch(err => {
    debug(err);
  });

module.exports = app;
