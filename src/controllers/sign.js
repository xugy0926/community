import R from 'ramda';
import validator from 'validator';
import utility from 'utility';
import uuid from 'node-uuid';
import config from '../config';
import { isNil, isNotNil } from '../functions/type';
import account from '../functions/account';
import * as mail from '../common/mail';
import * as tools from '../common/tools';
import * as authMiddleWare from '../middlewares/auth';
import { UserProxy } from '../proxy';

export const accesstoken = async (req, res) => {
  authMiddleWare.genSession(req.user, res);
  const active = (req.user && req.user.active) || false;
  const user = req.user;
  res.json({ data: { user, active } });
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
  if (!tools.validateId(loginname)) {
    return next(new Error('用户名不合法'));
  }
  if (!validator.isEmail(email)) {
    return next(new Error('邮箱不合法'));
  }
  if (password !== rePassword) {
    return next(new Error('两次密码输入不一致'));
  }

  const active = false;
  // END 验证信息的正确性

  try {
    const doc = await UserProxy.findOne({
      $or: [{ loginname }, { email }]
    });

    if (isNotNil(doc)) return next(new Error('账号已经存在'));

    const passwordHash = tools.bhash(password);
    await UserProxy.create({
      loginname,
      passwordHash,
      email,
      active
    });

    mail.sendActiveMail(
      email,
      utility.md5(email + passwordHash + config.sessionSecret),
      loginname
    );

    res.json({
      user: doc,
      active: false,
      message: `欢迎加入${config.name}！我们已给您的注册邮箱发送了一封邮件, 请点击里面的链接来激活您的帐号。`
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
    const doc = await UserProxy.findFullOne(account(loginname));
    if (isNil(doc)) return next(new Error('账号不存在'));
    const isOk = tools.bcompare(password, doc.pass);
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
        message: `此帐号还没有被激活，激活链接已发送到 ${doc.email} 邮箱，请查收。`
      });
      return;
    }

    authMiddleWare.genSession(doc, res);
    res.json({ user: doc, active: true });
  } catch (err) {
    next(err);
  }
};

export const signout = (req, res) => {
  req.session.destroy();
  res.clearCookie(config.authCookieName, { path: '/' });
  res.end();
};

export const activeAccount = async (req, res, next) => {
  const key = validator.trim(req.query.key || '');
  const loginname = validator.trim(req.query.name || '');

  try {
    const doc = await UserProxy.findFullOne({ loginname });
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

    await UserProxy.update(doc._id, data);
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
    const doc = await UserProxy.findFullOne({ email });
    if (!doc) return next(new Error('data not found'));

    const data = {
      retrieveKey: uuid.v4(),
      retrieveTime: new Date().getTime()
    };

    await UserProxy.update(doc._id, data);
    mail.sendResetPassMail(email, data.retrieveKey, doc.loginname);
    res.json({ msg: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。' });
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
    const doc = await UserProxy.findFullOne({
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
      pass: tools.bhash(password),
      active: true
    };

    await UserProxy.update(doc._id, data);
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
    const doc = await UserProxy.findFullOne({ _id: userId });
    const isOk = tools.bcompare(oldPassword, doc.pass);
    if (!isOk) {
      return next(new Error('老密码不对'));
    }

    const data = {
      pass: tools.bhash(newPassword),
      active: true
    };

    await UserProxy.update(userId, data);
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
    let user = await UserProxy.findOne({ githubId: profile.id });

    if (!user) {
      user = await UserProxy.createGithubUser({
        loginname: profile.username,
        email: email,
        githubId: profile.id,
        githubAccessToken: profile.accessToken,
        avatar: photo
      });
    } else {
      user.loginname = profile.username;
      user.email = email || user.email;
      user.avatar = photo;
      await user.save();
    }

    authMiddleWare.genSession(user, res);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
