import R from 'ramda';
import jwt from 'jwt-simple';
import bcrypt from 'bcrypt';
import validator from 'validator';
import utility from 'utility';
import uuid from 'node-uuid';
import addDays from 'date-fns/add_days';
import config from '../config';
import { isNil, isNotNil } from '../functions/type';
import account from '../functions/account';
import * as mail from '../common/mail';
import * as authMiddleWare from '../middlewares/auth';
import * as db from '../data/db';
import User from '../data/models/user';

const findOne = db.findOne(User)(R.__, {});
const updateById = db.updateById(User);
const create = db.create(User);

const opts = {
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 30,
  signed: true,
  httpOnly: true
};

export const signup = async (req, res, next) => {
  const loginname = validator.trim(req.body.loginname).toLowerCase();
  const email = validator.trim(req.body.email).toLowerCase();
  const password = validator.trim(req.body.password) || '';
  const rePassword = validator.trim(req.body.rePassword) || '';

  // 验证信息的正确性
  if ([loginname, password, rePassword, email].some(item => item === '')) {
    return next(new Error('信息不完整'));
  }
  if (loginname.length < 5) {
    return next(new Error('用户名至少需要5个字符'));
  }
  if (!R.test(/^[a-zA-Z0-9\-_]+$/i)(loginname)) {
    return next(new Error('用户名不合法'));
  }
  if (!validator.isEmail(email)) {
    return next(new Error('邮箱不合法'));
  }
  if (password !== rePassword) {
    return next(new Error('两次密码输入不一致'));
  }

  try {
    const doc = await findOne({
      $or: [{ loginname }, { email }]
    });

    if (isNotNil(doc)) return next(new Error('账号已经存在'));

    const passwordHash = bcrypt.hash(password);
    await create({
      loginname,
      passwordHash,
      email,
      accessToken: uuid.v4()
    });

    mail.sendActiveMail(
      email,
      utility.md5(email + passwordHash + config.sessionSecret),
      loginname
    );

    res.json({
      user: doc,
      active: false,
      message: `欢迎加入${
        config.name
      }！我们已给您的注册邮箱发送了一封邮件, 请点击里面的链接来激活您的帐号。`
    });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const loginname = validator.trim(req.body.loginname || '').toLowerCase();
  const password = validator.trim(req.body.password || '');

  if (isNil(loginname) || isNil(password)) {
    return next(new Error('信息不完整'));
  }

  try {
    const doc = await findOne(account(loginname));
    if (isNil(doc)) return next(new Error('账号不存在'));
    const isOk = bcrypt.compare(password, doc.pass);
    if (!isOk) return next(new Error('密码错误'));

    doc.pass = '';

    if (!doc.active) {
      mail.sendActiveMail(
        doc.email,
        utility.md5(doc.email + doc.pass + config.sessionSecret),
        doc.loginname
      );
      res.json({
        user: doc,
        active: false,
        message: `此帐号还没有被激活，激活链接已发送到 ${
          doc.email
        } 邮箱，请查收。`
      });
      return;
    }

    const user = doc.toObject();
    delete user.pass;
    delete user.githubAccessToken;

    if (config.ADMIN_ID === user.loginname || user.role === 'A') {
      user.isAdmin = true;
    } else if (user.role === 'S') {
      user.isSupport = true;
    } else {
      user.isNormal = true;
    }

    const token = jwt.encode(
      Object.assign(user, {
        exp: addDays(new Date(), 30)
          .valueOf()
      }),
      config.jwtSecret
    );

    res.cookie(config.authCookieName, token, opts);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const signout = (req, res) => {
  res.clearCookie(config.authCookieName, { path: '/' });
  res.end();
};

export const activeAccount = async (req, res, next) => {
  const key = validator.trim(req.query.key || '');
  const loginname = validator.trim(req.query.name || '');

  try {
    const doc = await findOne({ loginname });
    if (!doc) return next(new Error('data not found'));

    const key2 = utility.md5(doc.email + doc.pass + config.sessionSecret);
    if (key !== key2) {
      return next(new Error('信息有误，帐号无法被激活'));
    }

    if (doc.active) {
      return next(new Error('帐号已经是激活状态'));
    }

    const data = {
      active: true
    };

    await updateById(doc._id)(data);
    res.end('激活成功');
  } catch (err) {
    next(err);
  }
};

export const createSearchPassword = async (req, res, next) => {
  const email = validator.trim(req.body.email).toLowerCase();
  if (!validator.isEmail(email)) {
    return next(new Error('邮箱不合法'));
  }

  try {
    const doc = await findOne({ email });
    if (!doc) return next(new Error('data not found'));

    const data = {
      retrieveKey: uuid.v4(),
      retrieveTime: new Date().getTime()
    };

    await updateById(doc._id)(data);
    mail.sendResetPassMail(email, data.retrieveKey, doc.loginname);
    res.json({
      msg:
        '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'
    });
  } catch (err) {
    next(err);
  }
};

export const authSearchPassword = async (req, res, next) => {
  const key = validator.trim(req.body.key || '');
  const loginname = validator.trim(req.body.loginname || '');
  const password = validator.trim(req.body.password || '');
  const rePassword = validator.trim(req.body.rePassword || '');

  if (password !== rePassword) {
    return next(new Error('输入的密码不一致'));
  }

  try {
    const doc = await findOne({
      loginname,
      retrieveKey: key
    });

    if (isNil(doc)) {
      return next(new Error(`找不到用户${loginname}`));
    }

    const now = new Date().getTime();
    const oneDay = 1000 * 60 * 60 * 24;

    if (!doc.retrieveTime || now - doc.retrieveTime > oneDay) {
      return next(new Error('该链接已过期，请重新申请'));
    }

    const data = {
      retrieveTime: '',
      retrieveKey: '',
      pass: bcrypt.hash(password),
      active: true
    };

    await updateById(doc._id)(data);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const updateResetPassword = async (req, res, next) => {
  const userId = req.session.user._id;
  const oldPassword = validator.trim(req.body.oldPassword) || '';
  const newPassword = validator.trim(req.body.newPassword) || '';

  if (oldPassword === newPassword) {
    return next(new Error('新密码和老密码一致'));
  }

  try {
    const doc = await findOne({ _id: userId });
    const isOk = bcrypt.compare(oldPassword, doc.pass);
    if (!isOk) {
      return next(new Error('老密码不对'));
    }

    const data = {
      pass: bcrypt.hash(newPassword),
      active: true
    };

    await updateById(userId)(data);
    res.end();
  } catch (err) {
    next(err);
  }
};

export const github = async (req, res, next) => {
  const profile = req.user;
  let email = profile.emails && profile.emails[0] && profile.emails[0].value;
  let photo = profile.photos && profile.photos[0] && profile.photos[0].value;

  if (!email) {
    res.render('sign/noEmail');
    return;
  }

  try {
    let user = await findOne({ githubId: profile.id });

    if (!user) {
      user = await create({
        loginname: profile.username,
        email: email,
        githubId: profile.id,
        githubAccessToken: profile.accessToken,
        avatar: photo,
        active: true,
        accessToken: uuid.v4()
      });
    } else {
      user.loginname = profile.username;
      user.email = email || user.email;
      user.avatar = photo;
      await user.save();
    }

    delete user.pass;

    const token = jwt.encode(
      Object.assign(user, {
        exp: addDays(new Date(), 30)
          .valueOf()
      }),
      config.jwtSecret
    );

    res.cookie(config.authCookieName, token, opts);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
