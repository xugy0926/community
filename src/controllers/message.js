import config from '../config';
import ids from '../functions/ids';
import { onlyMe } from '../functions/limit';
import { MessageProxy, UserProxy, PostProxy, ReplyProxy } from '../proxy';

export const unreadCount = async (req, res, next) => {
  const userId = req.session.user._id;

  MessageProxy.count(userId, false)
    .then(count => res.json({ count }))
    .catch(next);
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
    const pages = await MessageProxy.count(userId, hasRead).then(count =>
      Math.ceil(count / limit)
    );
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

export const read = (req, res, next) => {
  const messageId = req.body.messageId;
  MessageProxy.update(messageId, { hasRead: true })
    .then(() => res.end())
    .catch(next);
};

export const toRead = (req, res, next) => {
  MessageProxy.updateAll(
    { masterId: req.session.user._id, hasRead: false },
    { hasRead: true }
  )
    .then(() => res.end())
    .catch(next);
};
