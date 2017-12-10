import { ZoneProxy } from '../proxy';

export const more = async (req, res, next) => {
  const all = req.query.all || false;
  const conditions = { deleted: false };

  if (!all) {
    conditions.enable = true;
  }

  const opt = { sort: '-weight' };

  try {
    const zones = await ZoneProxy.find(conditions, opt);
    res.json({ zones });
  } catch (err) {
    next(err);
  }
}

export const post = async (req, res, next) => {
  const key = req.body.key || '';
  const value = req.body.value || '';

  try {
    if (key === '' || value === '') {
      return next('内容不能为空');
    }

    const conditions = { $or: [{ key }, { value }] };    
    const doc = await ZoneProxy.findOne(conditions);
    if (doc) {
      return next('内容重复');
    }
    
    const result = await ZoneProxy.create(key, value);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export const del = async (req, res, next) => {
  const zoneId = req.params.id;

  try {
    await ZoneProxy.update(zoneId, { deleted: true });
    res.end();
  } catch (err) {
    next(err);
  }
}

export const update = async (req, res, next) => {
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

  try {
    await ZoneProxy.update(zoneId, data);
    res.end();
  } catch (err) {
    next(err);
  }
}
