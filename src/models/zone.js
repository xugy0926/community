import mongoose from 'mongoose';
import base from './base';
import timePlugin from './timePlugin';

const Schema = mongoose.Schema;

const ZoneSchema = new Schema(
  Object.assign(
    {
      key: { type: String, requried: true },
      value: { type: String, requried: true },
      template: { type: String, requried: true },
      enable: { type: Boolean, default: false },
      mustReview: { type: Boolean, default: false },
      audioAttachment: { type: Boolean, default: false },
      weight: { type: Number, default: 0 },
      icon: { type: String, default: '' },
      createText: { type: String, default: '新建' }
    },
    base
  )
);

ZoneSchema.plugin(timePlugin);
ZoneSchema.index({ createAt: -1 });

const Zone = mongoose.model('Zone', ZoneSchema);
export default Zone;
