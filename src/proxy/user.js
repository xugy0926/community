import R from 'ramda';
import uuid from 'node-uuid';
import User from '../models/user';

const baseFields = 'name loginname email weixin qq avatar role isStar createAt';
const detailFields =
  'name loginname weixin qq avatar accessToken role email url profileImageUrl location signature profile isStar postCount replyCount createAt';
const authFields = 'name loginname email retrieveKey, retrieveTime';

export const count = (conditions, options) => {
  return User.count(conditions).setOptions(options);
};

export const find = (conditions, options) => {
  return User.find(conditions)
    .select(baseFields)
    .setOptions(options)
    .exec();
};

export const findOne = (conditions, options) => {
  return User.findOne(conditions)
    .select(baseFields)
    .setOptions(options)
    .exec();
};

export const findFullOne = (conditions, options) => {
  return User.findOne(conditions)
    .setOptions(options)
    .exec();
};

export const findByNames = names => {
  return User.find({
    loginname: { $in: names }
  })
    .select(baseFields)
    .exec();
};

export const findOneById = id => {
  return User.findOne({ _id: id })
    .select(baseFields)
    .exec();
};

export const findOneDetailById = id => {
  return User.findOne({ _id: id })
    .select(detailFields)
    .exec();
};

export const findOneByName = name => {
  return User.findOne({
    loginname: new RegExp(`^${name}$`, 'i')
  })
    .select(baseFields)
    .exec();
};

export const findByIds = ids => {
  return User.find({ _id: { $in: ids } })
    .select(baseFields)
    .exec();
};

export const incCount = R.curry((authorId, prop) => {
  const data = {};
  data[prop] = 1;
  data.score = 5;
  return User.findByIdAndUpdate(authorId, { $inc: data }).exec();
});

export const create = ({ loginname, passwordHash, email, avatar, active }) => {
  const user = new User();
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
  const user = new User();
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
  return User.findByIdAndUpdate(id, { $set: data }).exec();
};
