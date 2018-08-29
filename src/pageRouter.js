import express from 'express';
import passport from 'passport';
import * as sign from './controllers/sign';
import * as page from './controllers/page';
import * as sitemap from './controllers/sitemap';
import {
  supportRequired,
  adminRequired,
  userRequired
} from './middlewares/auth';

const router = express.Router();

router.get('/', page.indexPage);

router.get('/signup', page.signupPage);
router.get('/signin', page.signinPage);

router.get('/password/searchFromMail', page.searchPasswordFromMailPage);
router.get('/password/inputFromMail', page.inputSearchPasswordPage);
router.get('/password/reset', userRequired, page.resetPasswordPage);

// user controller
router.get('/user/activeAccount', sign.activeAccount);
router.get('/user/:id/setting', userRequired, page.settingPage);
router.get('/user/:id/info', page.userPage);
router.get('/user/:id/posts', page.userPostsPage);
router.get('/user/:id/replies', page.userRepliesPage);
router.get('/user/:id/collectPosts', page.userCollectPostsPage);
router.get('/user/messages', userRequired, page.myMessagesPage);
router.get('/user/messages/all', userRequired, page.allMessagePage);

// posts
router.get('/posts', page.allPostsPage);

// post
router.get('/post/:id', page.showPostPage);
router.get('/edit/:id', userRequired, page.editPostPage);
router.get('/new', userRequired, page.createPostPage);

// about

router.get('/about', page.showAboutPage);

// cms
router.get('/cms/index', supportRequired, page.cmsPage);
router.get('/cms/zone', adminRequired, page.cmsZonePage);
router.get('/cms/user', adminRequired, page.cmsUserPage);
router.get('/cms/profile', adminRequired, page.cmsProfilePage);

// github
router.get('/auth/github', passport.authenticate('github'));
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/signin' }),
  sign.github
);

// sitemap
router.get('/sitemap.js', sitemap.index)

export default router;
