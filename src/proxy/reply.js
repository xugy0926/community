import Reply from '../models/reply';

const baseFields = '_id content';

export const count = (conditions, options) => {
  return Reply.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  return Reply.find(conditions)
    .setOptions(options)
    .exec();
};

export const findOne = (conditions, options) => {
  return Reply.findOne(conditions)
    .setOptions(options)
    .exec();
};

export const findOneById = id => {
  return Reply.findOne({ _id: id }).exec();
};

export const findByTopicId = id => {
  return Reply.find({ postId: id, deleted: false })
    .setOptions({
      sort: '-createAt'
    })
    .query.exec();
};

export const findByIds = ids => {
  return Reply.find({ _id: { $in: ids } })
    .select(baseFields)
    .exec();
};

export const update = (id, data) => {
  return Reply.findByIdAndUpdate(id, { $set: data }).exec();
};

export const create = ({ content, postId, authorId, replyId }) => {
  const doc = new Reply();
  doc.content = content;
  doc.postId = postId;
  doc.authorId = authorId;

  if (replyId) doc.replyId = replyId;

  return doc.save();
};

export const getLastReplyIdByPostId = id => {
  return Reply.findOne({ postId: id, deleted: false })
    .select('_id')
    .setOptions({ sort: '-createAt' })
    .exec();
};

export const getRepliesByAuthorId = (id, options) => {
  return Reply.find({ author_id: id })
    .setOptions(options)
    .exec();
};

export const getCountByAuthorId = id => {
  return Reply.count({ author_id: id });
};
