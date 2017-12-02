import Zone from '../models/zone';

const fields =
  '_id key value enable mustReview audioAttachment weight template icon createText';

export const find = (conditions, options) => {
  return Zone.find(conditions)
    .select(fields)
    .setOptions(options)
    .exec();
}

export const findOne = (conditions, options) => {
  return Zone.findOne(conditions)
    .select(fields)
    .setOptions(options)
    .exec();
}

export const findOneById = (id) => {
  return Zone.findOne({ _id: id }).select(fields).exec();
}

export const update = (id, data) => {
  return Zone.findByIdAndUpdate(id, { $set: data }).exec();
};

export const create = (key, value) => {
  const doc = new Zone();
  doc.key = key;
  doc.value = value;
  return doc.save();
};

export const remove = conditions => {};

export const removeById = id => {};
