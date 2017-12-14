import config from '../config';
import * as db from '../data/db';
import User from '../data/models/user';
import Message from '../data/models/message';
import { ADMIN_ID } from '../common/constants';

export const adminRequired = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.session.loginReferer = req.headers.referer;
    let err = new Error('需要登录');
    err.status = 403;
    next(err);
    return;
  }

  if (!req.session.user.isAdmin) {
    let err = new Error('需要管理员权限');
    err.status = 403;
    next(err);
    return;
  }

  next();
};

export const supportRequired = (req, res, next) => {
  if (!req.session || !req.session.user) {
    let err = new Error('需要登录');
    err.status = 403;
    next(err);
    return;
  }

  if (!req.session.user.isSupport && !req.session.user.isAdmin) {
    let err = new Error('需要运营权限权限');
    err.status = 403;
    next(err);
    return;
  }

  next();
};

export const userRequired = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.user._id) {
    let err = new Error('需要登录');
    err.status = 403;
    next(err);
    return;
  }

  next();
};

export const blockUser = () => {
  return (req, res, next) => {
    if (req.path === '/signout') {
      next();
      return;
    }

    if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
      next('您已被管理员屏蔽了。有疑问请联系管理员');
      return;
    }

    next();
  };
};

export const genSession = (user, res) => {
  const authToken = `${user._id}$$$$`;
  const opts = {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    signed: true,
    httpOnly: true
  };

  res.cookie(config.authCookieName, authToken, opts);
};

export const authUser = (req, res, next) => {
  res.locals.currentUser = null;
  if (req.session && req.session.user) {
    const user = req.session.user;
    if (ADMIN_ID === user.loginname || user.role === 'A') {
      user.isAdmin = true;
    } else if (user.role === 'S') {
      user.isSupport = true;
    } else {
      user.isNormal = true;
    }

    db.count(Message)({ masterId: user._id, hasRead: false }, {}).then(count => {
      res.locals.count = count;
      req.session.user = user;
      res.locals.currentUser = user;
      next();
    });
  } else {
    const authToken = req.signedCookies[config.authCookieName] || '';
    if (authToken) {
      const auth = authToken.split('$$$$');
      const userId = auth[0];
      if (userId) {
        db.findOneById(User)(userId)
          .then(user => {
            if (user) {
              user = user.toObject();
              if (ADMIN_ID === user.loginname || user.role === 'A') {
                user.isAdmin = true;
              } else if (user.role === 'S') {
                user.isSupport = true;
              } else {
                user.isNormal = true;
              }

              db.count(Message)({ masterId: user._id, hasRead: false }, {}).then(count => {
                res.locals.count = count;
                req.session.user = user;
                res.locals.currentUser = user;
              });
            }

            next();
          })
          .catch(err => next(err));
      } else {
        next();
      }
    } else {
      next();
    }
  }
};
