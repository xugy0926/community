import R from 'ramda';

export const count = R.curry(function(model, conditions, options) {
  conditions.deleted = false;
  return model.count(conditions).setOptions(options);
});

export const find = R.curry(function(model, conditions, options) {
  conditions.deleted = false;
  return model
    .find(conditions)
    .setOptions(options)
    .exec();
});

export const findOne = R.curry(function(model, conditions, options) {
  conditions.deleted = false;
  return model
    .findOne(conditions)
    .setOptions(options)
    .exec();
});

export const findOneById = R.curry(function(model, id) {
  return model
    .findOne({_id: id, deleted: false})
    .exec();
});

export const incById = R.curry(function (model, id, props) {
  return model.findByIdAndUpdate(id, { $inc: props }).exec();
});

export const create = R.curry(function(model, data) {
  const doc = new model(data);
  return doc.save();
});

export const update = R.curry(function(model, conditions, data) {
  delete data._id;
  delete data.createAt;
  delete data.updateAt;
  return model.where(conditions)
    .setOptions({ multi: true })
    .update({ $set: data })
    .exec();
});

export const updateById = R.curry(function(model, id, data) {
  delete data._id;
  delete data.createAt;
  delete data.updateAt;
  return model.findByIdAndUpdate(id, { $set: data }).exec();
});

export const remove = R.curry(function(model, conditions) {
  return model.remove(conditions);
});
