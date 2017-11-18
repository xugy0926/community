import mongoose from 'mongoose';
import base from './base';
import timePlugin from './timePlugin';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReplySchema = new Schema(
  Object.assign(
    {
      content: { type: String, requried: true },
      postId: { type: ObjectId },
      authorId: { type: ObjectId },
      replyId: { type: ObjectId },
      ups: [Schema.Types.ObjectId]
    },
    base
  )
);

ReplySchema.plugin(timePlugin);
ReplySchema.index({ postd: 1 });
ReplySchema.index({ authorId: 1, createAt: -1 });

const ReplyModel = mongoose.model('Reply', ReplySchema);
export default ReplyModel;
