import ProfileModel from '../models/profile';

export const findOne = () => {
  return ProfileModel.findOne({}).exec();
};

export const findOneById = id => {
  return ProfileModel.findOne({ _id: id }).exec();
};

export const update = (id, data) => {
  return ProfileModel.findByIdAndUpdate(id, { $set: data }).exec();
};

export const create = (guide, isHtml) => {
  const doc = new ProfileModel();
  doc.guide = guide;
  doc.isHtml = isHtml;
  return doc.save();
};
