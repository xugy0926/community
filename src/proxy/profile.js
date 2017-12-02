import Profile from '../models/profile';

export const findOne = () => {
  return Profile.findOne({}).exec();
};

export const findOneById = id => {
  return Profile.findOne({ _id: id }).exec();
};

export const update = (id, data) => {
  return Profile.findByIdAndUpdate(id, { $set: data }).exec();
};

export const create = (guide, isHtml) => {
  const doc = new Profile();
  doc.guide = guide;
  doc.isHtml = isHtml;
  return doc.save();
};
