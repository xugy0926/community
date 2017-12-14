import config from '../config';
import ids from '../functions/ids';
import { onlyMe } from '../functions/limit';
import * as db from '../data/db';
import Post from '../data/models/post';
import User from '../data/models/user';
import Message from '../data/models/message';
import Reply from '../data/models/reply';

export const unreadCount = async (req, res, next) => {
  const masterId = req.session.user._id;
  const hasRead = false;

  db
    .count(Message)(masterId, hasRead)
    .then(count => res.json({ count }))
    .catch(next);
};

export const userMessages = async (req, res, next) => {
  const masterId = req.session.user._id;
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
    const messages = await db.find(Message)({ masterId, hasRead })(options);
    const pages = await db
      .count(Message)({ masterId, hasRead }, {})
      .then(count => Math.ceil(count / limit));
    const authors = await db.find(User)({
      _id: { $in: ids('authorId')(messages) }
    })({});
    const posts = await db.find(Post)({
      _id: { $in: ids('postId')(messages) }
    })({});
    const replies = await db.find(Reply)({
      _id: { $in: ids('replyId')(messages) }
    })({});

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

export const read = (req, res, next) => {
  const messageId = req.body.messageId;
  db
    .updateById(Message)(messageId)({ hasRead: true })
    .then(() => res.end())
    .catch(next);
};

export const toRead = (req, res, next) => {
  db
    .update(Message)({ masterId: req.session.user._id, hasRead: false })({
      hasRead: true
    })
    .then(() => res.end())
    .catch(next);
};
