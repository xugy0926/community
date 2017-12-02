import * as at from '../common/at';
import * as tools from '../common/tools';
import * as UserProxy from './user';
import * as ZoneProxy from './zone';
import Post from '../models/post';

const baseFields = '_id title recommentUrl description';

const fields =
  '_id title description recommendUrl area authorId updateAt good lock top status replyCount ups';

export const count = (conditions, options) => {
  return Post.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  conditions.deleted = false;
  const query = Post.find(conditions)
    .select(fields)
    .setOptions(options);
  return query.exec();
};

export const findOne = (conditions, options) => {
  conditions.deleted = false;
  return Post.findOne(conditions)
    .select(fields)
    .setOptions(options)
    .exec();
};

export const findOneById = id => {
  return Post.findOne({ _id: id }).exec();
};

export const findFullOneById = async id => {
  try {
    let post = await Post.findOne({ _id: id }).exec();
    if (!post) return Promise.reject(ResultMsg.DATA_NOT_FOUND);
    post = post.toObject();
    post.linkedContent = at.linkUsers(post.content);
    post.createAt = tools.formatDate(post.createAt);
    post.updateAt = tools.formatDate(post.updateAt);
    const author = await UserProxy.findOneById(post.authorId);
    post.author = author;
    const zone = await ZoneProxy.findOneById(post.zoneId);
    post.zone = zone;

    return Promise.resolve(post);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const findByIds = ids => {
  if (typeof ids !== 'object') throw new Error(ResultMsg.NOT_OBJECT);
  if (!Array.isArray(ids)) throw new Error(ResultMsg.NOT_ARRAY);
  const query = Post.find({ _id: { $in: ids } }).select(baseFields);
  return query.exec();
};

export const updateLastReply = async (postId, replyId) => {
  if (typeof postId !== 'string' && typeof postId !== 'object')
    throw new Error(ResultMsg.NO_ID);
  if (typeof replyId !== 'string' && typeof replyId !== 'object')
    throw new Error(ResultMsg.NO_ID);

  const data = {
    replyId,
    lastReplyAt: new Date(),
    replyCount: 1
  };

  const data2 = {
    replyCount: 1
  };

  try {
    await Post.findByIdAndUpdate(postId, { data });
    await Post.findByIdAndUpdate(postId, { $inc: data2 });
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

export const reducePostCount = async (postId, lastReplyId) => {
  const data = {
    lastReplyId,
    lastReplyAt: new Date(),
    replyCount: 1
  };

  const data2 = {
    replyCount: -1
  };

  try {
    await Post.findByIdAndUpdate(postId, { data });
    await Post.findByIdAndUpdate(postId, { $inc: data2 });
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve();
};

export const create = post => {
  const data = new Post();
  data.zoneId = post.zoneId;
  data.title = post.title;
  data.area = post.area;
  data.description = post.description;
  data.content = post.content;
  data.recommendUrl = post.recommendUrl;
  data.advertisingMap = post.advertisingMap;
  data.authorId = post.authorId;
  data.status = post.status;
  data.mdType = post.mdType;
  data.tags = post.tags;
  data.isHtml = post.isHtml;
  return data.save();
};

export const update = (id, data) => {
  delete data._id;
  delete data.createAt;
  delete data.updateAt;
  return Post.findByIdAndUpdate(id, { $set: data }).exec();
};
