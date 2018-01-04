import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.ObjectId;

export default function(id) {
  return ObjectId.valueOf(id);
}
