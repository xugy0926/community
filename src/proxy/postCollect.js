import PostCollect from '../models/postCollect';

export const count = (conditions, options) => {
  return PostCollect.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  return PostCollect.find(conditions)
    .setOptions(options)
    .exec();
};

export const findOne = (userId, postId) => {
  return PostCollect.findOne({ userId, postId }).exec();
};

export const create = (userId, postId) => {
  const doc = new PostCollect();
  doc.userId = userId;
  doc.postId = postId;
  return doc.save();
};

export const remove = (userId, postId) => {
  return PostCollect.remove({ userId, postId });
};
