import * as db from '../data/db';
import Profile from '../data/models/profile';

export const one = async (req, res, next) => {
  try {
    const profile = await db.findOne(Profile)({}, {});
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
    const doc = await db.findOneById(Profile)(id);

    const data = { guide, isHtml };

    if (!doc) {
      await db.create(Profile)(data);
    } else {
      await db.updateById(Profile)(id)(data);
    }

    res.end();
  } catch (err) {
    next(err);
  }
};

export const create = (req, res, next) => {
  const guide = req.body.guide || '';
  const isHtml = req.body.isHtml || false;

  db
    .create(Profile)({ guide, isHtml })
    .then(profile => res.json({ profile }))
    .catch(next);
};
