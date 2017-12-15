import R from 'ramda';
import config from '../config';
import props from '../functions/props';
import conditionsIds from '../functions/conditionsIds';
import { onlyMe } from '../functions/limit';
import * as db from '../data/db';
import Post from '../data/models/post';
import User from '../data/models/user';
import Message from '../data/models/message';
import Reply from '../data/models/reply';

const limit = config.postListCount;
const pagesCount = R.divide(R.__, limit);

export const unreadCount = (req, res, next) => {
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


  const options = {
    skip: (currentPage - 1) * limit,
    limit,
    sort: '-updateAt'
  };

  const hasRead = type !== 'unRead';

  try {
    const messages = await db.find(Message)({ masterId, hasRead })(options);

    const find = db.find(R.__)(R.__, {});

    const pages = await db
      .count(Message)({ masterId, hasRead }, {})
      .then(pagesCount);
    const authors = await find(User)(conditionsIds(props('authorId')(messages)));
    const posts = await find(Post)(conditionsIds(props('postId')(messages)));
    const replies = await find(Reply)(conditionsIds(props('replyId')(messages)));

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
