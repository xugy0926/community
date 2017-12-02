import config from '../config';
import ids from '../functions/ids';
import { onlyMe } from '../functions/limit';
import {
  MessageProxy,
  UserProxy,
  PostProxy,
  ReplyProxy
} from '../proxy';

export const unreadCount = async (req, res, next) => {
  const userId = req.session.user._id;

  try {
    const count = await MessageProxy.count(userId, false);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

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
    const authors = await UserProxy.findByIds(ids('authorId')(messages));
    const posts = await PostProxy.findByIds(ids('postId')(messages));
    const replies = await ReplyProxy.findByIds(ids('replyId')(messages));

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
};

export const read = async (req, res, next) => {
  const messageId = req.body.messageId;

  try {
    await MessageProxy.update(messageId, { hasRead: true });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const toRead = async (req, res, next) => {
  try {
    await MessageProxy.updateAll(
      { masterId: req.session.user._id, hasRead: false },
      { hasRead: true }
    );
    res.end();
  } catch (err) {
    next(err);
  }
};
