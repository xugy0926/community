import _ from 'lodash';
import validator from 'validator';
import config from '../config';
import * as at from '../common/at';
import * as tools from '../common/tools';
import markdown from '../common/markdown';
import upFile from '../common/upFile';
import getPages from '../common/pages';
import { checkId, checkPostOperateLimit } from '../common/check';
import { UserProxy, PostProxy, PostCollectProxy } from '../proxy';

async function fetchPosts(conditions, options) {
  try {
    const limit = config.postListCount;
    const count = await getPages(PostProxy.count, conditions, 'pages');
    const posts = await PostProxy.find(conditions, options);
    const pages = Math.ceil(count / limit);
    let ids = posts.map(item => item.authorId);
    ids = _.uniq(ids);
    const authors = await UserProxy.findByIds(ids);
    return Promise.resolve([posts, pages, authors]);
  } catch (err) {
    return Promise.reject(err);
  }
}

export const more = async (req, res, next) => {
  const zoneId = req.query.zoneId || '';
  const currentPage = parseInt(req.query.currentPage, 10) || 1;
  const status = req.query.status || 'P';
  const authorId = req.query.authorId || '';
  let good = validator.toBoolean(
    typeof req.query.good !== 'undefined' ? req.query.good : 'false'
  );

  if (zoneId === '') {
    return next(new Error());
  }

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

  conditions.zoneId = zoneId;

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
    await checkId(userId);
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

  const conditions = { userId };
  const limit = config.postListCount;
  const options = {
    skip: (currentPage - 1) * limit,
    limit,
    sort: '-_createAt'
  };

  const zones = res.locals.zones;

  try {
    await checkId(userId);
    const count = await getPages(
      PostCollectProxy.count,
      conditions,
      `${userId}collect_posts_pages`
    );
    const pages = Math.ceil(count / limit);
    const postIds = await PostCollectProxy.find(conditions, options);
    const posts = [];
    for (let i = postIds.length - 1; i >= 0; i--) {
      let post = await PostProxy.findOneById(postIds[i].postId);
      const author = await UserProxy.findOneById(post.authorId);
      post = post.toObject();
      post.author = author;

      let index = _.findIndex(zones, function(zone) {
        return zone._id.toString() === post.zoneId.toString();
      });

      post.zoneKey = zones[index].key;
      post.zoneIcon = zones[index].icon;
      posts.push(post);
    }

    res.json({ posts: posts, pages, currentPage });
  } catch (err) {
    next(err);
  }
};

export const one = async (req, res, next) => {
  const postId = req.params.id;

  try {
    await checkId(postId);
    let post = await PostProxy.findFullOneById(postId);
    post.mdContent = markdown(post.linkedContent);
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

export const post = async (req, res, next) => {
  const zoneId = req.body.zoneId || '';
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
    zoneId,
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
    await UserProxy.increaseScore(post.authorId, { postCount: 1 });
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
    await checkPostOperateLimit(post.authorId, isAdmin, currentUserId);

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
      update_at: new Date()
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
    await checkId(postId);
    const post = await PostProxy.findOneById(postId);
    await checkPostOperateLimit(post.authorId, isAdmin, currentUserId);

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
    await checkId(id);
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
    await checkId(id);
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
    await checkId(id);
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
    await checkId(id);
    await checkId(userId);
    const collect = await PostCollectProxy.findOne(userId, id);
    if (collect) {
      return res.end();
    }

    const post = await PostProxy.findOneById(id);
    if (!post) {
      return next(new Error('此话题不存在'));
    }

    await PostProxy.update(id, {
      collect_count: post.collectCount + 1
    });
    await PostCollectProxy.create(userId, id);
    const user = await UserProxy.findOneById(userId);

    await PostProxy.update(id, {
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
    await checkId(id);
    await checkId(userId);
    await PostCollectProxy.remove(userId, id);

    const post = await PostProxy.findOneById(id);
    if (!post) {
      return next(new Error('此话题不存在'));
    }

    await PostProxy.update(id, {
      collect_count: post.collectCount - 1
    });

    const user = await UserProxy.findOneById(userId);
    await PostProxy.update(id, {
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
    await checkId(id);
    const post = await PostProxy.findOneById(id);
    await checkPostOperateLimit(post.authorId, isAdmin, currentUserId);

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
    await checkId(id);
    const post = await PostProxy.findOneById(id);
    if (post.authorId.toString() === userId && !req.session.user.isAdmin) {
      throw new Error('不能帮自己点赞');
    }

    const upIndex = post.ups.indexOf(userId);

    let data = {};
    if (upIndex < 0) {
      post.ups.push(userId);
      // sendUpPostNotify(req.session.user, author, post, reply);
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
