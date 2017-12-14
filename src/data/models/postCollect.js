import mongoose from 'mongoose';
import base from './base';
import timePlugin from './timePlugin';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const PostCollectSchema = new Schema(
  Object.assign(
    {
      userId: { type: ObjectId, requried: true },
      postId: { type: ObjectId, requried: true }
    },
    base
  )
);

PostCollectSchema.plugin(timePlugin);
PostCollectSchema.index({ userId: 1, postId: 1 }, { unique: true });

const PostCollect = mongoose.model('PostCollect', PostCollectSchema);
export default PostCollect;
