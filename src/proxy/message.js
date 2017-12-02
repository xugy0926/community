import * as UserProxy from './user';
import * as PostProxy from './post';
import * as ReplyProxy from './reply';
import MessageModel from '../models/message';

export const count = (id, hasRead) => {
  return MessageModel.count({ masterId: id, hasRead: hasRead });
};

export const find = async (conditions, options) => {
  try {
    const messages = await MessageModel.find(conditions)
      .setOptions(options)
      .exec();

    for (let i = 0; i < messages.length; i++) {
      let post = null;
      let author = null;
      let reply = null;

      messages[i] = messages[i].toObject();

      if (messages[i].postId) {
        post = await PostProxy.findOneById(messages[i].postId);
        messages[i].post = post;
      }

      if (messages[i].authorId) {
        author = await UserProxy.findOneById(messages[i].authorId);
        messages[i].author = author;
      }

      if (messages[i].replyId) {
        reply = await ReplyProxy.findOneById(messages[i].replyId);
        messages[i].reply = reply;
      }
    }

    return Promise.resolve(messages);
  } catch (err) {
    return Promise.reject();
  }
}

export const findOneById = id => {
  return MessageModel.findOneById(id).exec();
};

export const findByUserId = (userId, hasRead, options) => {
  return find({ masterId: userId, hasRead: hasRead }, options);
};

export const update = (id, data) => {
  return MessageModel.findByIdAndUpdate(id, { $set: data }).exec();
};

export const updateAll = (conditions, data) => {
  return MessageModel.where(conditions)
    .setOptions({ multi: true })
    .update({ $set: data })
    .exec();
};

export const create = ({ type, masterId, authorId, postId, replyId }) => {
  const doc = new MessageModel();
  doc.type = type;
  doc.masterId = masterId;
  doc.authorId = authorId;
  doc.postId = postId;
  doc.replyId = replyId;
  return doc.save();
};
