import uuid from 'node-uuid';
import UserModel from '../models/user';

const baseFields = 'name loginname email weixin qq avatar role isStar createAt';
const detailFields =
  'name loginname weixin qq avatar accessToken role email url profileImageUrl location signature profile isStar postCount replyCount createAt';
const authFields = 'name loginname email retrieveKey, retrieveTime';

export const count = (conditions, options) => {
  return UserModel.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  return UserModel.find(conditions)
    .select(baseFields)
    .setOptions(options)
    .exec();
};

export const findOne = (conditions, options) => {
  return UserModel.findOne(conditions)
    .select(baseFields)
    .setOptions(options)
    .exec();
};

export const findFullOne = (conditions, options) => {
  return UserModel.findOne(conditions)
    .setOptions(options)
    .exec();
};

export const findByNames = names => {
  return UserModel.find({
    loginname: { $in: names }
  })
    .select(baseFields)
    .exec();
};

export const findOneById = id => {
  return UserModel.findOne({ _id: id })
    .select(baseFields)
    .exec();
};

export const findOneDetailById = id => {
  return UserModel.findOne({ _id: id })
    .select(detailFields)
    .exec();
};

export const findOneByName = name => {
  return UserModel.findOne({
    loginname: new RegExp(`^${name}$`, 'i')
  })
    .select(baseFields)
    .exec();
};

export const findByIds = ids => {
  return UserModel.find({ _id: { $in: ids } })
    .select(baseFields)
    .exec();
};

export const increaseScore = (authorId, { postCount, replyCount }) => {
  if (typeof authorId !== 'string' && typeof authorId !== 'object')
    throw new Error(ResultMsg.NO_ID);
  postCount = !postCount ? 0 : postCount;
  replyCount = !replyCount ? 0 : replyCount;

  const data = {};
  if (postCount != 0) {
    data.score = 5;
    data.postCount = 1;
  }

  if (replyCount != 0) {
    data.score = 5;
    data.replyCount = 1;
  }

  return UserModel.findByIdAndUpdate(authorId, { $inc: data }).exec();
};

export const create = ({ loginname, passwordHash, email, avatar, active }) => {
  const user = new UserModel();
  user.name = loginname;
  user.loginname = loginname;
  user.pass = passwordHash;
  user.email = email;
  user.avatar = avatar || '';
  user.active = active || false;
  user.accessToken = uuid.v4();

  return user.save();
};

export const createGithubUser = ({
  loginname,
  email,
  location,
  githubId,
  githubAccessToken,
  avatar
}) => {
  const user = new UserModel();
  user.loginname = loginname;
  if (email !== 'noemail') {
    user.email = email;
  }
  user.location = location;
  user.githubId = githubId;
  user.githubAccessToken = githubAccessToken;
  user.avatar = avatar || '';
  user.active = true;
  user.accessToken = uuid.v4();

  return user.save();
};

export const update = (id, data) => {
  return UserModel.findByIdAndUpdate(id, { $set: data }).exec();
};
