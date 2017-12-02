import mongoose from 'mongoose';
import timePlugin from './timePlugin';
import base from './base'
import * as CONSTANTS from '../common/constants';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  Object.assign(
    {
      name: { type: String },
      loginname: { type: String, required: true },
      pass: { type: String },
      email: { type: String },
      url: { type: String },
      profileImageUrl: { type: String },
      location: { type: String },
      signature: { type: String },
      profile: { type: String },
      weixin: { type: String },
      qq: { type: String },
      weibo: { type: String },
      avatar: { type: String },
      githubId: { type: String },
      githubUsername: { type: String },
      githubAccessToken: { type: String },
      isBlock: { type: Boolean, default: false },
      role: { type: String, default: CONSTANTS.ROLE_TYPE.Normal },
      score: { type: Number, default: 0 },
      postCount: { type: Number, default: 0 },
      replyCount: { type: Number, default: 0 },
      followerCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      collectTagCount: { type: Number, default: 0 },
      collectPostCount: { type: Number, default: 0 },
      isStar: { type: Boolean },
      level: { type: String },
      active: { type: Boolean, default: false },
      receiveReplyMail: { type: Boolean, default: false },
      receiveAtMail: { type: Boolean, default: false },
      retrieveTime: { type: Number },
      retrieveKey: { type: String },
      accessToken: { type: String }
    },
    base
  )
);

UserSchema.plugin(timePlugin);

UserSchema.methods.isAdmin = function isAdmin() {
  return (
    this.role === CONSTANTS.ROLE_TYPE.Admin ||
    this.loginname === CONSTANTS.ADMIN_ID
  );
};

UserSchema.methods.isSupport = function isSupport() {
  return this.role === CONSTANTS.ROLE_TYPE.Support;
};

UserSchema.index({ loginname: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ score: -1 });
UserSchema.index({ githubId: 1 });
UserSchema.index({ accessToken: 1 });

const User = mongoose.model('User', UserSchema);
export default User;
