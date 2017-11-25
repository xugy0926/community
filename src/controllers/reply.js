import _ from 'lodash';
import validator from 'validator';
import config from '../config';
import * as at from '../common/at';
import * as message from '../common/message';
import getPages from '../common/pages';
import { sendReplyNotify, sendUpReplyNotify } from '../common/mail';
import { checkId } from '../common/check';
import { UserProxy, PostProxy, ReplyProxy } from '../proxy';

export const more = async (req, res, next) => {
  const postId = req.query.postId;
  const currentPage = parseInt(req.body.currentPage, 10) || 1;
  const conditions = { postId, deleted: false };
  const limit = config.replyListCount;
  const options = { skip: (currentPage - 1) * limit, limit, sort: 'createAt' };

  try {
    const count = await getPages(ReplyProxy.count, conditions, '[reply pages]');
    const pages = Math.ceil(count / limit);
    const replies = await ReplyProxy.find(conditions, options);

    let replyAuthorIds = [];

    replies.forEach(item => {
      if (item.authorId) replyAuthorIds.push(item.authorId.toString());
    });

    replyAuthorIds = _.uniq(replyAuthorIds);
    const authors = await UserProxy.findByIds(replyAuthorIds);
    res.json({ currentPage, replies, authors, pages });
  } catch (err) {
    next(err);
  }
}

export const post = async (req, res, next) => {
  const content = validator.trim(String(req.body.content || ''));
  const postId = req.body.postId;
  const replyId = req.body.replyId || '';
  const authorId = req.session.user._id;

  if (content === '') {
    next(new Error('不能回复空内容'));
    return;
  }

  if (!postId || !authorId) {
    next(new Error('信息错误'));
    return;
  }

  let data = {
    authorId,
    replyId,
    postId,
    content
  };

  try {
    const post = await PostProxy.findOneById(postId);
    if (!post) {
      next(new Error());
      return;
    }

    const postAuthor = await UserProxy.findOneById(post.authorId);

    let reply = await ReplyProxy.create(data);
    await PostProxy.updateLastReply(postId, reply._id);

    at.sendMessageToMentionUsers(content, postId, authorId, reply._id);
    await message.sendReplyMessage(post.authorId, authorId, postId, reply._id);

    const author = await UserProxy.increaseScore(authorId, {
      replyCount: 1
    });
    reply = reply.toObject();
    reply.author = author;
    sendReplyNotify(req.session.user, postAuthor, post, reply);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

export const del = async (req, res, next) => {
  const replyId = req.params.id;
  const userId = req.session.user._id.toString();

  try {
    await checkId(replyId);
    const reply = await ReplyProxy.findOneById(replyId);

    if (reply.authorId.toString() !== userId && !req.session.user.isAdmin) {
      next(new Error());
      return;
    }

    await ReplyProxy.update(replyId, {
      deleted: true
    });
    const lastReplyId = await ReplyProxy.getLastReplyIdByPostId(reply.postId);
    await PostProxy.reducePostCount(reply.postId, lastReplyId);
    res.end();
  } catch (err) {
    next(err);
  }
}

export const update = async (req, res, next) => {
  const replyId = req.params.id;
  const content = req.body.content;
  const userId = req.session.user._id.toString();

  if (content.trim().length <= 3) {
    next(new Error());
    return;
  }

  try {
    const reply = await ReplyProxy.findOneById(replyId);

    if (reply.authorId.toString() !== userId && !req.session.user.isAdmin) {
      next(new Error());
      return;
    }

    const data = {
      content
    };

    await ReplyProxy.update(replyId, data);
    res.end();
  } catch (err) {
    next(err);
  }
}

export const up = async (req, res, next) => {
  const replyId = req.params.id;
  const userId = req.session.user._id;

  try {
    await checkId(replyId);
    const reply = await ReplyProxy.findOneById(replyId);
    const author = await UserProxy.findOneById(reply.authorId);
    const post = await PostProxy.findOneById(reply.postId);

    if (reply.authorId.toString() === userId && !req.session.user.isAdmin) {
      next(new Error());
      return;
    }

    const upIndex = reply.ups.indexOf(userId);

    let data = {};
    if (upIndex < 0) {
      reply.ups.push(userId);
      sendUpReplyNotify(req.session.user, author, post, reply);
    } else {
      reply.ups.splice(upIndex, 1);
    }

    data.ups = reply.ups;

    await ReplyProxy.update(replyId, data);
    res.json({ ups: data.ups });
  } catch (err) {
    next(err);
  }
}

export const count = async (req, res, next) => {
  const postId = req.params.id;
  try {
    let count = await ReplyProxy.count({ postId }, {});
    res.json({ count });
  } catch (err) {
    next(err);
  }
}
