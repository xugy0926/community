import fs from 'fs';
import path from 'path';
import markdown from '../common/markdown';
import suggestGoodPosts from '../components/suggestPostsPanel';
import createPanel from '../components/createPanel';
import {
  ProfileProxy,
  ZoneProxy,
  UserProxy,
  PostCollectProxy,
  PostProxy
} from '../proxy';

export const indexPage = async (req, res, next) => {
  const zones = res.locals.zones || [];

  try {
    if (zones.length < 1) {
      return res.redirect('/cms/zone');
    }

    const profile = await ProfileProxy.findOne();
    const html = await suggestGoodPosts(zones[0]);
    res.render('index', {
      selectedKey: 'home',
      blocks: zones,
      suggestHtml: html,
      profile
    });
  } catch (err) {
    next(err);
  }
};

export const zonePage = async (req, res, next) => {
  try {
    const zone = res.locals.zone;
    const html = await createPanel(zone);
    let page = 'template/' + zone.template + '/index';
    res.render(page, {
      selectedKey: zone.key,
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
  req.session.loginReferer = req.headers.referer;
  res.render('sign/signin');
};

export const signinPage2 = (req, res) => {
  req.session.loginReferer = req.headers.referer;
  res.render('sign/signin2');
};

export const searchPasswordFromMailPage = (req, res) => {
  res.render('sign/searchPasswordFromMail');
};

export const inputSearchPasswordPage = async (req, res, next) => {
  const key = req.query.key || '';
  const loginname = req.query.loginname || '';

  try {
    let user = await UserProxy.findOne({ loginname, retrieveKey: key });
    if (user) {
      res.render('sign/inputSearchPassword', { key, loginname });
    } else {
      next(new Error('请重新发起充值密码请求'));
    }
  } catch (err) {
    next(err);
  }
};

export const resetPasswordPage = (req, res) => {
  const userId = req.session.user._id;
  res.render('sign/resetPassword', { userId });
};

export const myMessagesPage = (req, res) => {
  const userId = req.session.user._id || '';
  const type = req.params.type || 'read';
  res.render('message/index', { userId, type });
};

export const allMessagePage = (req, res) => {
  const type = req.query.type || 'read';
  const userId = req.session.user._id || '';
  res.render('message/all', { userId, type });
};

export const showPostPage = async (req, res, next) => {
  const id = req.params.id;
  const userId =
    req.session.user && req.session.user._id ? req.session.user._id : '';

  try {
    const post = await PostProxy.findFullOneById(id);
    const zone = await ZoneProxy.findOneById(post.zoneId);
    if (userId) {
      const collect = await PostCollectProxy.findOne(userId, id);

      post.isCollect = collect ? true : false;
    }

    let page = 'template/' + zone.template + '/show';
    res.render(page, { post, zoneId: zone._id });
  } catch (err) {
    next(err);
  }
};

export const createPostPage = async (req, res, next) => {
  try {
    const zone = res.locals.zone;
    let page = 'template/' + zone.template + '/create';
    res.render(page, {zoneId: zone._id});
  } catch (err) {
    next(err);
  }
};

export const editPostPage = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const zone = res.locals.zone;
    let page = 'template/' + zone.template + '/edit';
    res.render(page, { postId, zoneId: zone._id });
  } catch (err) {
    next(err);
  }
};

export const userPage = async (req, res, next) => {
  const id = req.params.id;
  try {
    let user = await UserProxy.findOneDetailById(id);
    res.render('user/index', { user });
  } catch (err) {
    next(err);
  }
};

export const userPostsPage = async (req, res, next) => {
  const id = req.params.id;

  try {
    let user = await UserProxy.findOneById(id);
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
    let user = await UserProxy.findOneById(id);
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
  const userId = req.session.user._id;
  res.render('user/setting', { userId });
};

export const showAboutPage = (req, res) => {
  const file = fs.readFileSync(path.join(__dirname, '../views/static/about.md'), 'utf-8');
  const content = markdown(file);
  res.render('static/index', {content});
};
