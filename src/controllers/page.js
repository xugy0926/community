import fs from 'fs';
import path from 'path';
import marked from '../common/marked';
import suggestGoodPosts from '../components/suggestPostsPanel';
import createPanel from '../components/createPanel';
import * as db from '../data/db';
import * as transaction from '../data/transaction';
import Zone from '../data/models/zone';
import Post from '../data/models/post';
import User from '../data/models/user';
import PostCollect from '../data/models/postCollect';
import Profile from '../data/models/profile';

export const indexPage = async (req, res, next) => {
  res.render('index');
};

export const zonePage = async (req, res, next) => {
  try {
    const zone = res.locals.zone;
    const html = await createPanel(zone);
    res.render(`template/${zone.template}/index`, {
      zoneKey: zone.key,
      template: zone.template,
      zoneId: zone._id,
      type: req.query.type,
      createPanel: html
    });
  } catch (err) {
    next(err);
  }
};

export const cmsPage = (req, res) => {
  res.render('cms/index', { pageTitle: '全部', navTab: 'post' });
};

export const cmsAppPage = (req, res) => {
  res.render('cms/appInfo', { pageTitle: '全部' });
};

export const cmsZonePage = (req, res) => {
  res.render('zone/index', { navTab: 'zone' });
};

export const cmsUserPage = (req, res) => {
  res.render('cms/user');
};

export const cmsStaticPage = (req, res) => {
  res.render('static/index');
};

export const cmsProfilePage = (req, res) => {
  res.render('cms/profile');
};

export const signupPage = (req, res) => {
  res.render('sign/signup');
};

export const signinPage = (req, res) => {
  res.render('sign/signin');
};

export const searchPasswordFromMailPage = (req, res) => {
  res.render('sign/searchPasswordFromMail');
};

export const inputSearchPasswordPage = async (req, res, next) => {
  const key = req.query.key || '';
  const loginname = req.query.loginname || '';

  try {
    let user = await db.findOne(User)({ loginname, retrieveKey: key }, {});
    if (user) {
      res.render('sign/inputSearchPassword', { key, loginname });
    } else {
      next(new Error('请重新发起重置密码请求'));
    }
  } catch (err) {
    next(err);
  }
};

export const resetPasswordPage = (req, res) => {
  const userId = req.user._id;
  res.render('sign/resetPassword', { userId });
};

export const myMessagesPage = (req, res) => {
  const userId = req.user._id || '';
  const type = req.params.type || 'read';
  res.render('message/index', { userId, type });
};

export const allMessagePage = (req, res) => {
  const type = req.query.type || 'read';
  const userId = req.user._id || '';
  res.render('message/all', { userId, type });
};

export const showPostPage = async (req, res, next) => {
  const postId = req.params.id;
  const userId =
    req.user && req.user._id ? req.user._id : '';

  try {
    const post = await transaction.fullPost(postId);
    const zone = await db.findOneById(Zone)(post.zoneId);
    if (userId) {
      const collect = await db.findOne(PostCollect)({ userId, postId }, {});
      post.isCollect = collect ? true : false;
    }

    let page = `template/${zone.template}/show`;
    res.render(page, { post, zoneId: zone._id });
  } catch (err) {
    next(err);
  }
};

export const createPostPage = async (req, res, next) => {
  try {
    const zone = res.locals.zone;
    let page = `template/${zone.template}/create`;
    res.render(page, { zoneId: zone._id });
  } catch (err) {
    next(err);
  }
};

export const editPostPage = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const zone = res.locals.zone;
    let page = `template/${zone.template}/edit`;
    res.render(page, { postId, zoneId: zone._id });
  } catch (err) {
    next(err);
  }
};

export const userPage = async (req, res, next) => {
  const id = req.params.id;
  try {
    let user = await db.findOneById(User)(id);
    res.render('user/index', { user });
  } catch (err) {
    next(err);
  }
};

export const userPostsPage = async (req, res, next) => {
  const id = req.params.id;

  try {
    let user = await db.findOneById(User)(id);
    res.render('user/posts', {
      userId: user ? user._id : '',
      userName: user ? user.loginname : ''
    });
  } catch (err) {
    next(err);
  }
};

export const userCollectPostsPage = async (req, res, next) => {
  const id = req.params.id;

  try {
    let user = await db.findOneById(User)(id);
    res.render('user/collect_posts', {
      userId: user ? user._id : '',
      userName: user ? user.loginname : ''
    });
  } catch (err) {
    next(err);
  }
};

export const userRepliesPage = (req, res) => {
  const userName = req.params.name;
  res.render('user/replies', { userName });
};

export const settingPage = (req, res) => {
  const userId = req.user._id;
  res.render('user/setting', { userId });
};

export const showAboutPage = (req, res) => {
  const file = fs.readFileSync(path.join(__dirname, '../views/static/about.md'), 'utf-8');
  const content = marked(file);
  res.render('static/index', { content });
};
