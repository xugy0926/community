import mongoose from 'mongoose';
import base from './base';
import timePlugin from './timePlugin';
import config from '../../config';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const PostSchema = new Schema(
  Object.assign(
    {
      zoneId: { type: ObjectId, required: true },
      title: { type: String, required: true },
      advertisingMap: { type: String },
      description: { type: String },
      content: { type: String },
      authorId: { type: ObjectId },
      recommendUrl: { type: String },
      top: { type: Boolean, default: false },
      lock: { type: Boolean, default: false },
      replyCount: { type: Number, default: 0 },
      visitCount: { type: Number, default: 0 },
      collectCount: { type: Number, default: 0 },
      lastReply: { type: ObjectId },
      lastReplyAt: { type: Date, default: Date.now },
      contentIsHtml: { type: Boolean },
      status: { type: String },
      mdType: { type: String, default: config.mdType },
      canReply: { type: Boolean, default: true },
      tags: [String],
      isHtml: { type: Boolean, default: false },
      area: { type: String },
      ups: [Schema.Types.ObjectId]
    },
    base
  )
);

PostSchema.plugin(timePlugin);
PostSchema.index({ updateAt: -1 });
PostSchema.index({ createAt: -1 });
PostSchema.index({ top: -1, lastReplyAt: -1 });
PostSchema.index({ authorId: 1, createAt: -1 });

const Post = mongoose.model('Post', PostSchema);
export default Post;
