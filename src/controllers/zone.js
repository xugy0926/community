import * as db from '../data/db';
import Zone from '../data/models/zone';

export const more = (req, res, next) => {
  const all = req.query.all || false;
  const conditions = { deleted: false };

  if (!all) {
    conditions.enable = true;
  }

  const options = { sort: '-weight' };

  db
    .find(Zone)(conditions, options)
    .then(zones => res.json({ zones }))
    .catch(next);
};

export const post = async (req, res, next) => {
  const key = req.body.key || '';
  const value = req.body.value || '';

  try {
    if (key === '' || value === '') {
      return next('内容不能为空');
    }

    const conditions = { $or: [{ key }, { value }] };
    const doc = await db.findOne(Zone)(conditions, {});
    if (doc) {
      return next('内容重复');
    }

    const result = await db.create(Zone)({ key, value });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const del = (req, res, next) => {
  const zoneId = req.params.id;
  db
    .updateById(Zone)(zoneId)({ deleted: true })
    .then(() => res.end())
    .catch(next);
};

export const update = (req, res, next) => {
  const zoneId = req.params.id;
  const enable = req.body.enable || false;
  const key = req.body.key || '';
  const value = req.body.value || '';
  const weight = req.body.weight || 0;
  const mustReview = req.body.mustReview || false;
  const template = req.body.template || '';
  const icon = req.body.icon || '';
  const createText = req.body.createText || '';
  const audioAttachment = req.body.audioAttachment || false;

  const data = {
    enable,
    key,
    value,
    weight,
    mustReview,
    template,
    icon,
    createText,
    audioAttachment
  };

  db
    .updateById(Zone)(zoneId)(data)
    .then(() => res.end())
    .catch(next);
};
