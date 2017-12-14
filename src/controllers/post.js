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
import { UserProxy, PostProxy, PostCollectProxy } from '../proxy';

async function fetchPosts(conditions, options) {
  try {
    const pages = await getPages(PostProxy.count)('pages')(conditions);
    const posts = await PostProxy.find(conditions, options);
    const authors = await UserProxy.findByIds(ids('authorId')(posts));
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
    sort: '-createAt'
  };

  try {
    const pages = await getPages(PostCollectProxy.count)(
      `${userId}collect_posts_pages`
    )(conditions);
    const collects = await PostCollectProxy.find(conditions, options);
    const postIds = R.map(R.prop('postId'))(collects);
    const posts = await PostProxy.findByIds(postIds);
    const authorIds = R.map(R.prop('authorId'))(posts);
    const authors = await UserProxy.findByIds(authorIds);
    res.json({ posts, pages, currentPage, authors });
  } catch (err) {
    next(err);
  }
};

export const one = (req, res, next) => {
  const postId = req.params.id;

  PostProxy.findFullOneById(postId)
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
    const post = await PostProxy.create(data);
    await UserProxy.incCount(post.authorId)('postCount');
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
    const post = await PostProxy.findOneById(postId);
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

    await PostProxy.update(postId, data);
    at.sendMessageToMentionUsers(content, postId, req.session.user._id);
    res.json({
      url: `${config.apiPrefix.page}/post/${post._id}`
    });
  } catch (err) {
    next(err);
  }
};

export const del = async (req, res, next) => {
  const postId = req.params.id;
  const isAdmin = req.session.user.isAdmin;
  const currentUserId = req.session.user._id;

  try {
    const post = await PostProxy.findOneById(postId);
    onlyMe(req)(post.authorId)(currentUserId);

    await PostProxy.update(postId, {
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
    const post = await PostProxy.findOneById(id);

    await PostProxy.update(id, {
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
    const post = await PostProxy.findOneById(id);

    await PostProxy.update(id, {
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
    const post = await PostProxy.findOneById(id);

    await PostProxy.update(id, {
      lock: !post.lock
    });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const collect = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.session.user._id;

  try {
    const collect = await PostCollectProxy.findOne(userId, id);
    if (collect) {
      return res.end();
    }
    await PostCollectProxy.create(userId, id);
    
    const post = await PostProxy.findOneById(id);
    if (!post) {
      return next(new Error('此话题不存在'));
    }

    await PostProxy.update(id, {
      collectCount: post.collectCount + 1
    });
    const user = await UserProxy.findOneDetailById(userId);
    await UserProxy.update(userId, {
      collectPostCount: user.collectPostCount + 1
    });
    req.session.user.collectPostCount += 1;
    res.end();
  } catch (err) {
    next(err);
  }
};

export const delCollect = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.session.user._id;

  try {
    await PostCollectProxy.remove(userId, id);

    const post = await PostProxy.findOneById(id);
    if (!post) {
      return next(new Error('此话题不存在'));
    }
    await PostCollectProxy.create(userId, id);
    await PostProxy.update(id, {
      collectCount: post.collectCount - 1
    });
    const user = await UserProxy.findOneDetailById(userId);
    await UserProxy.update(userId, {
      collectPostCount: user.collectPostCount - 1
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
    const post = await PostProxy.findOneById(id);
    onlyMe(req)(post.authorId)(currentUserId);

    await PostProxy.update(id, { status });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const up = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.session.user._id;

  try {
    const post = await PostProxy.findOneById(id);
    withoutMe(req)(post.authorId)(userId);

    const upIndex = post.ups.indexOf(userId);

    let data = {};
    if (upIndex < 0) {
      post.ups.push(userId);
    } else {
      post.ups.splice(upIndex, 1);
    }

    data.ups = post.ups;

    await PostProxy.update(id, data);
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
