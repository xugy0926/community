import mongoose from 'mongoose';
import base from './base';
import timePlugin from './timePlugin';

const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
  Object.assign(
    {
      guide: { type: String, default: 'no data' },
      isHtml: { type: Boolean, default: false }
    },
    base
  )
);

ProfileSchema.plugin(timePlugin);
ProfileSchema.index({ createAt: -1 });

const Profile = mongoose.model('Profile', ProfileSchema);
export default Profile;
