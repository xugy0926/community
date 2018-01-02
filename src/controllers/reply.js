import validator from 'validator';
import props from '../functions/props';
import { onlyMe, withoutMe } from '../functions/limit';
import * as at from '../common/at';
import * as message from '../common/message';
import getPages from '../common/pages';
import config from '../config';
import { sendReplyNotify, sendUpReplyNotify } from '../common/mail';
import * as db from '../data/db';
import Post from '../data/models/post';
import Reply from '../data/models/reply';
import User from '../data/models/user';

export const more = async (req, res, next) => {
  const postId = req.query.postId;
  const currentPage = parseInt(req.body.currentPage, 10) || 1;
  const conditions = { postId, deleted: false };
  const limit = config.postListCount;
  const options = { skip: (currentPage - 1) * limit, limit, sort: '_createAt' };

  try {
    const pages = await getPages(db.count(Reply))('reply-post')(conditions);
    const replies = await db.find(Reply)(conditions)(options);
    const authors = await db.find(User)(
      { _id: { $in: props('authorId')(replies) } },
      {}
    );
    res.json({ currentPage, replies, authors, pages });
  } catch (err) {
    next(err);
  }
};

export const post = async (req, res, next) => {
  const content = validator.trim(String(req.body.content || ''));
  const postId = req.body.postId;
  const replyId = req.body.replyId || '';
  const authorId = req.user._id;

  if (content.trim().length <= 2) {
    return next('最少两个字以上!');
  }

  if (!postId || !authorId) {
    return next('信息错误');
  }

  let data = {
    authorId,
    postId,
    content
  };

  if (replyId) {
    data.replyId = replyId;
  }

  try {
    const post = await db.findOneById(Post)(postId);
    if (!post) {
      return next('找不到文章');
    }

    const postAuthor = await db.findOneById(User)(post.authorId);

    let reply = await db.create(Reply)(data);
    await db.incById(Post)(postId, { replyCount: 1 });
    at.sendMessageToMentionUsers(content, postId, authorId, reply._id);
    await message.sendReplyMessage(post.authorId, authorId, postId, reply._id);
    
    const author = await db.incById(User)(authorId)({
      replyCount: 1,
      score: 5
    });
    reply = reply.toObject();
    reply.author = author;
    sendReplyNotify(req.user, postAuthor, post, reply);

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};

export const del = async (req, res, next) => {
  const replyId = req.params.id;
  const userId = req.user._id.toString();

  try {
    const reply = await db.findOneById(Reply)(replyId);
    onlyMe(req)(reply.authorId)(userId);
    await db.updateById(Reply)(replyId)({
      deleted: true
    });

    await db.incById(Post)(reply.postId, { replyCount: -1 });
    await db.incById(User)(userId)({ replyCount: -1, score: -5 });

    res.end();
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  const replyId = req.params.id;
  const content = req.body.content;
  const userId = req.user._id.toString();

  if (content.trim().length <= 2) {
    return next('最少两个字以上!');
  }

  try {
    const reply = await db.findOneById(Reply)(replyId);
    onlyMe(req)(reply.authorId)(userId);
    await db.updateById(Reply)(replyId)({ content });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const up = async (req, res, next) => {
  const replyId = req.params.id;
  const userId = req.user._id;

  try {
    const reply = await db.findOneById(Reply)(replyId);
    const author = await db.findOneById(User)(reply.authorId);
    const post = await db.findOneById(Post)(reply.postId);

    withoutMe(req)(reply.authorId)(userId);

    const upIndex = reply.ups.indexOf(userId);

    let data = {};
    if (upIndex < 0) {
      reply.ups.push(userId);
      sendUpReplyNotify(req.user, author, post, reply);
    } else {
      reply.ups.splice(upIndex, 1);
    }

    data.ups = reply.ups;

    await db.updateById(Reply)(replyId)(data);
    res.json({ ups: data.ups });
  } catch (err) {
    next(err);
  }
};

export const count = async (req, res, next) => {
  const postId = req.params.id;
  try {
    let count = await db.count(Reply)({ postId }, {});
    res.json({ count });
  } catch (err) {
    next(err);
  }
};
