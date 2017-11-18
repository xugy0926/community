import PostCollectModel from '../models/postCollect';

export const count = (conditions, options) => {
  return PostCollectModel.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  return PostCollectModel.find(conditions)
    .setOptions(options)
    .exec();
};

export const findOne = (userId, postId) => {
  return PostCollectModel.findOne({ userId, postId }).exec();
};

export const create = (userId, postId) => {
  const doc = new PostCollectModel();
  doc.userId = userId;
  doc.postId = postId;
  return doc.save();
};

export const remove = (userId, postId) => {
  return PostCollectModel.remove({ userId, postId });
};
