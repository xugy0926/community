import mongoose from 'mongoose';
import base from './base';
import timePlugin from './timePlugin';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

/*
 * [type]
 * reply: xx 回复了你的话题
 * reply2: xx 在话题中回复了你
 * follow: xx 关注了你
 * at: xx ＠了你
 */

const MessageSchema = new Schema(
  Object.assign(
    {
      type: { type: String, requried: true },
      masterId: { type: ObjectId }, // 给谁的？
      authorId: { type: ObjectId }, // 谁发的？
      postId: { type: ObjectId },
      replyId: { type: ObjectId },
      author: {
        id: { type: ObjectId },
        name: { type: String }
      },
      post: {
        id: { type: ObjectId },
        authorId: { type: ObjectId },
        title: { type: String },
      },
      reply: {
        id: { type: ObjectId },
        content: { type: String }
      },
      hasRead: { type: Boolean, default: false }
    },
    base
  )
);

MessageSchema.plugin(timePlugin);
MessageSchema.index({ masterId: 1, hasRead: -1, createAt: -1 });

const Message = mongoose.model('Message', MessageSchema);
export default Message;
