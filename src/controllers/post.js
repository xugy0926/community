import _ from 'lodash';
import R from 'ramda';
import validator from 'validator';
import config from '../config';
import ids from '../functions/ids';
import { onlyMe, withoutMe } from '../functions/limit';
import getObjById from '../functions/getObjById';
import * as at from '../common/at';
import markdown from '../common/markdown';
import upFile from '../common/upFile';
import getPages from '../common/pages';
import * as db from '../data/db';
import * as transaction from '../data/transaction';
import Post from '../data/models/post';
import User from '../data/models/user';
import PostCollect from '../data/models/postCollect';

async function fetchPosts(conditions, options) {
  try {
    const pages = await getPages(db.count(Post))('pages')(conditions);
    const posts = await db.find(Post)(conditions, options);
    const authors = await db.find(User)({
      _id: { $in: ids('authorId')(posts) }
    })({});
    return Promise.resolve([posts, pages, authors]);
  } catch (err) {
    return Promise.reject(err);
  }
}

export const more = async (req, res, next) => {
  const currentPage = parseInt(req.query.currentPage, 10) || 1;
  const status = req.query.status || 'P';
  const authorId = req.query.authorId || '';
  let good = validator.toBoolean(
    typeof req.query.good !== 'undefined' ? req.query.good : 'false'
  );

  const conditions = {};

  if (status !== 'all') {
    conditions.status = status;
  }

  if (good) {
    conditions.good = good;
  }

  if (authorId) {
    conditions.authorId = authorId;
  }

  conditions.zoneId = res.locals.zone._id;

  const limit = config.postListCount;
  const options = {
    skip: (currentPage - 1) * limit,
    limit,
    sort: '-createAt'
  };

  try {
    const [posts, pages, authors] = await fetchPosts(conditions, options);
    res.json({ posts, currentPage, pages, authors });
  } catch (err) {
    next(err);
  }
};

export const userPosts = async (req, res, next) => {
  const userId = req.params.id || '';
  const currentPage = parseInt(req.query.currentPage, 10) || 1;
  const limit = config.postListCount;
  const options = {
    skip: (currentPage - 1) * limit,
    limit,
    sort: '-top -lastReplyAt'
  };

  try {
    const conditions = { authorId: userId };
    const [posts, pages, authors] = await fetchPosts(conditions, options);
    res.json({ posts, currentPage, pages, authors });
  } catch (err) {
    next(err);
  }
};

export const collectPosts = async (req, res, next) => {
  const userId = req.params.id || '';
  const currentPage = req.body.currentPage || 1;
  const limit = config.postListCount;
  const conditions = { userId };
  const options = {
    skip: (currentPage - 1) * limit,
    limit,
    sort: 'createAt'
  };

  try {
    const pages = await getPages(db.count(PostCollect))(
      `${userId}collect_posts_pages`
    )(conditions);
    const collects = await db.find(PostCollect)(conditions)(options);
    const postIds = R.map(R.prop('postId'))(collects);
    const posts = await db.find(Post)({ _id: { $in: postIds } });
    const authorIds = R.map(R.prop('authorId'))(posts);
    const authors = await db.find(User)({ _id: { $in: authorIds }});
    res.json({ posts, pages, currentPage, authors });
  } catch (err) {
    next(err);
  }
};

export const one = (req, res, next) => {
  const postId = req.params.id;

  transaction.fullPost(postId)
    .then(post => {
      post.mdContent = markdown(post.linkedContent);
      res.json({ post });
    })
    .catch(next);
};

export const post = async (req, res, next) => {
  const title = req.body.title || '';
  const area = req.body.area || '';
  const description = req.body.description || '';
  const content = req.body.content || '';
  const status = req.body.status || 'saved';
  const mdType = req.body.mdType || config.mdType;
  const tags = req.body.tags || [];
  const isHtml = req.body.isHtml || false;
  const advertisingMap = req.body.advertisingMap || '';
  const recommendUrl = req.body.recommendUrl || '';
  const authorId = req.session.user._id;

  if (title === '') {
    return next(new Error('标题不能为空'));
  }

  if (title.length < 4) {
    return next(new Error('标题太短（需4个字以上）'));
  }

  const data = {
    zoneId: res.locals.zone._id,
    title,
    description,
    content,
    area,
    authorId: req.session.user._id,
    status,
    mdType,
    tags,
    advertisingMap,
    recommendUrl,
    isHtml
  };

  try {
    const post = await db.create(Post)(data);
    await db.incById(User)(post.authorId)({ 'postCount': 1 });
    at.sendMessageToMentionUsers(content, post._id, authorId);
    res.json({
      url: `${config.apiPrefix.page}/post/${post._id}`
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  const postId = req.params.id || '';
  const title = req.body.title || '';
  const area = req.body.area || '';
  const description = req.body.description || '';
  const content = req.body.content || '';
  const status = req.body.status;
  const mdType = req.body.mdType || config.mdType;
  const tags = req.body.tags || [];
  const advertisingMap = req.body.advertisingMap || '';
  const recommendUrl = req.body.recommendUrl || '';
  const isHtml = req.body.isHtml || false;

  if (title === '') {
    return next(new Error('标题不能为空'));
  }

  if (title.length < 4) {
    return next(new Error('标题太短（需4个字以上）'));
  }

  const isAdmin = req.session.user.isAdmin;
  const currentUserId = req.session.user._id;

  try {
    const post = await db.findOneById(Post)(postId);
    onlyMe(req)(post.authorId)(currentUserId);

    const data = {
      title,
      area,
      description,
      content,
      status,
      mdType,
      tags,
      advertisingMap,
      recommendUrl,
      isHtml,
      updateAt: new Date()
    };

    await db.update(Post)(postId)(data);
    at.sendMessageToMentionUsers(content, postId, req.session.user._id);
    res.json({
      url: `${config.apiPrefix.page}/post/${post._id}`
    });
  } catch (err) {
    next(err);
  }
};

export const del = async (req, res, next) => {
  const id = req.params.id;
  const isAdmin = req.session.user.isAdmin;
  const currentUserId = req.session.user._id;

  try {
    const post = await db.findOneById(Post)(id);
    onlyMe(req)(post.authorId)(currentUserId);

    await db.updateById(Post)(id)({
      deleted: true
    });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const top = async (req, res, next) => {
  const id = req.params.id;

  try {
    const post = await db.findOneById(Post)(id);
    await db.updateById(Post)(id)({
      top: !post.top
    });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const good = async (req, res, next) => {
  const id = req.params.id;

  try {
    const post = await db.findOneById(Post)(id);

    await db.updateById(Post)(id)({
      good: !post.good
    });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const lock = async (req, res, next) => {
  const id = req.params.id;

  try {
    const post = await db.findOneById(Post)(id);

    await db.updateById(Post)(id)({
      lock: !post.lock
    });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const collect = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  try {
    const collect = await db.findOne(PostCollect)(userId, postId);
    if (collect) {
      return res.end();
    }
    await db.create(PostCollect)(userId, postId);

    const post = await db.findOneById(Post)(postId);
    if (!post) {
      return next(new Error('此话题不存在'));
    }

    await db.updateById(Post)(postId)({
      collectCount: post.collectCount + 1
    });

    await db.incById(User)(userId)({
      collectPostCount: 1
    });
    req.session.user.collectPostCount += 1;
    res.end();
  } catch (err) {
    next(err);
  }
};

export const delCollect = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  try {
    const post = await db.findOneById(Post)(postId);
    if (!post) {
      return next(new Error('此话题不存在'));
    }
    await db.remove(PostCollect)({ userId, postId });
    await db.updateById(Post)(postId)({
      collectCount: post.collectCount - 1
    });

    await db.incById(User)(userId)({
      collectPostCount: -1
    });

    req.session.user.collectPostCount -= 1;
    res.end();
  } catch (err) {
    next(err);
  }
};

export const status = async (req, res, next) => {
  const id = req.params.id;
  const status = req.body.status || 'saved';
  const isAdmin = req.session.user.isAdmin;
  const currentUserId = req.session.user._id;

  try {
    const post = await db.findOneById(Post)(id);
    onlyMe(req)(post.authorId)(currentUserId);

    await db.updateById(Post)(id)({ status });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const up = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.session.user._id;

  try {
    const post = await db.findOneById(Post)(id);
    withoutMe(req)(post.authorId)(userId);

    const upIndex = post.ups.indexOf(userId);

    let data = {};
    if (upIndex < 0) {
      post.ups.push(userId);
    } else {
      post.ups.splice(upIndex, 1);
    }

    data.ups = post.ups;

    await db.updateById(Post)(id)(data);
    res.json({ ups: data.ups });
  } catch (err) {
    next(err);
  }
};

export const upload = (req, res, next) => {
  let isFileLimit = false;
  req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    file.on('limit', () => {
      isFileLimit = true;

      res.json({
        success: false,
        msg: `File size too large. Max is ${config.fileLimit}`
      });
    });

    upFile(file, { filename }, (err, result) => {
      if (err) {
        return next(err);
      }
      if (isFileLimit) {
        return;
      }
      res.json({
        success: true,
        url: result.url
      });
    });
  });

  req.pipe(req.busboy);
};
