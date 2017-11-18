import ZoneModel from '../models/zone';

const fields =
  '_id key value enable mustReview audioAttachment weight template icon createText';

export const find = (conditions, options) => {
  return ZoneModel.find(conditions)
    .select(fields)
    .setOptions(options)
    .exec();
}

export const findOne = (conditions, options) => {
  return ZoneModel.findOne(conditions)
    .select(fields)
    .setOptions(options)
    .exec();
}

export const findOneById = (id) => {
  return ZoneModel.findOne({ _id: id }).select(fields).exec();
}

export const update = (id, data) => {
  return ZoneModel.findByIdAndUpdate(id, { $set: data }).exec();
};

export const create = (key, value) => {
  const doc = new ZoneModel();
  doc.key = key;
  doc.value = value;
  return doc.save();
};

export const remove = conditions => {};

export const removeById = id => {};
