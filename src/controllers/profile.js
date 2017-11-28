import { ProfileProxy } from '../proxy';

export const one = async (req, res, next) => {
  try {
    const profile = await ProfileProxy.findOne();
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  const id = req.params.id;
  const guide = req.body.guide || '';
  const isHtml = req.body.isHtml || false;

  try {
    const doc = await ProfileProxy.findOneById(id);

    const data = { guide, isHtml };

    if (!doc) {
      await ProfileProxy.create(data);
    } else {
      await ProfileProxy.update(id, data);
    }

    res.end();
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  const guide = req.body.guide || '';
  const isHtml = req.body.isHtml || false;

  try {
    const profile = await ProfileProxy.create(guide, isHtml);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};
