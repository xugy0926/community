import _ from 'lodash';
import config from '../config';
import { checkId } from '../common/check';
import { MessageProxy, UserProxy, PostProxy, ReplyProxy } from '../proxy';

export const unreadCount = async (req, res, next) => {
  const userId = req.session.user._id;

  try {
    const count = await MessageProxy.count(userId, false);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

export const userMessages = async (req, res, next) => {
  const userId = req.session.user._id;
  const currentPage = parseInt(req.body.currentPage, 10) || 1;
  const type = req.body.type || 'unRead';

  const limit = config.postListCount;
  const options = {
    skip: (currentPage - 1) * limit,
    limit,
    sort: '-top -updateAt'
  };

  const hasRead = type !== 'unRead';

  try {
    const messages = await MessageProxy.findByUserId(userId, hasRead, options);
    const count = await MessageProxy.count(userId, hasRead);
    const pages = Math.ceil(count / limit);

    // get authors
    let authorsIds = [];

    messages.forEach(item => {
      if (item.authorId) authorsIds.push(item.authorId.toString());
    });

    authorsIds = _.uniq(authorsIds);
    const authors = await UserProxy.findByIds(authorsIds);

    // get posts
    let postsIds = [];

    messages.forEach(item => {
      if (item.postId) postsIds.push(item.postId.toString());
    });

    postsIds = _.uniq(postsIds);
    const posts = await PostProxy.findByIds(postsIds);
    let replyIds = [];

    messages.forEach(item => {
      if (item.postId) replyIds.push(item.replyId.toString());
    });

    replyIds = _.uniq(replyIds);
    const replies = await ReplyProxy.findByIds(replyIds);

    res.json({
      messages,
      pages,
      currentPage,
      posts,
      authors,
      replies
    });
  } catch (err) {
    next(err);
  }
}

export const read = async (req, res, next) => {
  const messageId = req.body.messageId;

  const data = {
    hasRead: true
  };

  try {
    await checkId(messageId);
    await MessageProxy.update(messageId, data);
    res.end();
  } catch (err) {
    next(err);
  }
}

export const toRead = async (req, res, next) => {
  const data = {
    hasRead: true
  };

  try {
    await MessageProxy.updateAll(
      { masterId: req.session.user._id, hasRead: false },
      data
    );
    res.end();
  } catch (err) {
    next(err);
  }
}
