import ReplyModel from '../models/reply';

const baseFields = '_id content';

export const count = (conditions, options) => {
  return ReplyModel.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  return ReplyModel.find(conditions)
    .setOptions(options)
    .exec();
};

export const findOne = (conditions, options) => {
  return ReplyModel.findOne(conditions)
    .setOptions(options)
    .exec();
};

export const findOneById = id => {
  return ReplyModel.findOne({ _id: id }).exec();
};

export const findByTopicId = id => {
  return ReplyModel.find({ postId: id, deleted: false })
    .setOptions({
      sort: 'create_at'
    })
    .query.exec();
};

export const findByIds = ids => {
  return ReplyModel.find({ _id: { $in: ids } })
    .select(baseFields)
    .exec();
};

export const update = (id, data) => {
  return ReplyModel.findByIdAndUpdate(id, { $set: data }).exec();
};

export const create = ({ content, postId, authorId, replyId }) => {
  const doc = new ReplyModel();
  doc.content = content;
  doc.postId = postId;
  doc.authorId = authorId;

  if (replyId) doc.replyId = replyId;

  return doc.save();
};

export const getLastReplyIdByPostId = id => {
  return ReplyModel.findOne({ postId: id, deleted: false })
    .select('_id')
    .setOptions({ sort: '-createAt' })
    .exec();
};

export const getRepliesByAuthorId = (id, options) => {
  return ReplyModel.find({ author_id: id })
    .setOptions(options)
    .exec();
};

export const getCountByAuthorId = id => {
  return ReplyModel.count({ author_id: id });
};
