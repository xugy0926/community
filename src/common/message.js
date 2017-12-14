import logger from './logger';
import * as db from '../data/db';
import Message from '../data/models/message';

export function sendReplyMessage(masterId, authorId, postId, replyId) {
  if (!masterId || !authorId || !postId || !replyId) {
    logger.debug(
      'sendReplyMessage'.red,
      'type=at',
      `${masterId}&${authorId}&${postId}&${replyId}`
    );
    return Promise.reject(new Error('params error'));
  }

  return db.create(Message)({
    type: 'reply',
    masterId,
    authorId,
    postId,
    replyId
  });
}

export function sendAtMessage(masterId, authorId, postId, replyId) {
  if (!masterId || !authorId || !postId || !replyId) {
    logger.debug(
      'sendAtMessage'.red,
      'type=at',
      `${masterId}&${authorId}&${postId}&${replyId}`
    );
    return Promise.REJECT(new Error('params error'));
  }

  return db.create(Message)({
    type: 'at',
    masterId,
    authorId,
    postId,
    replyId
  });
}
