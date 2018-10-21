import express from 'express';
import * as sign from './controllers/sign';
import * as user from './controllers/user';
import * as message from './controllers/message';
import * as post from './controllers/post';
import * as reply from './controllers/reply';
import { search } from './controllers/search';

import {
  authRequired,
  supportRequired,
  adminRequired,
  userRequired
} from './middlewares/auth';

const router = express.Router();

// sign
router.post('/user/signup', sign.signup);
router.post('/user/signin', sign.signin);
router.post('/user/signout', sign.signout);

router.post('/user/createSearchPassword', sign.createSearchPassword);
router.post('/user/resetPassword', sign.resetPassword);
router.post('/user/:id/resetPassword', userRequired, sign.updateResetPassword);

// user
router.get('/user/:id/posts', userRequired, post.userPosts);
router.get('/user/:id/detail', userRequired, user.one);
router.patch('/user/:id/update', userRequired, user.patch);
router.get('/user/:id/collectPosts', userRequired, post.collectPosts);
router.get('/user/:id/draftPosts', userRequired, post.draftPosts);
router.post('/user/block', adminRequired, user.block);
router.post('/user/list', adminRequired, user.users);
router.post('/user/updateRole', adminRequired, user.updateRole);

// posts
router.get('/posts', post.more);
router.get('/posts/:id', post.one);
router.post('/posts', userRequired, post.post);
router.patch('/posts/:id', userRequired, post.update);
router.patch('/posts/:id/tag', adminRequired, post.tag);
router.patch('/posts/:id/up', userRequired, post.up);
router.patch('/posts/:id/top', userRequired, post.top);
router.patch('/posts/:id/lock', userRequired, post.lock);
router.patch('/posts/:id/collect', userRequired, post.collect);
router.patch('/posts/:id/delCollect', userRequired, post.delCollect);
router.delete('/posts/:id', userRequired, post.del);

// reply
router.get('/replies', reply.more);
router.post('/replies', userRequired, reply.post);
router.patch('/replies/:id', userRequired, reply.update);
router.delete('/replies/:id', userRequired, reply.del);
router.patch('/replies/:id/up', userRequired, reply.up);
router.post('/upload', userRequired, post.upload);

// message
router.post('/message/unread/count', userRequired, message.unreadCount);
router.post('/message/data', userRequired, message.userMessages);
router.post('/message/read', userRequired, message.read);
router.patch('/message/toRead', userRequired, message.toRead);

// search
router.get('/search', search);

export default router;
