import config from '../config';
import getPages from '../common/pages';
import * as db from '../data/db';
import User from '../data/models/user';

export const one = async (req, res, next) => {
  const userId = req.params.id || '';

  if (!userId && req.user._id && !userId.equals(req.user._id)) {
    return next(new Error('没权限查看'));
  }

  try {
    const user = await db.findOneById(User)(userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const patch = async (req, res, next) => {
  const weixin = req.body.weixin || '';
  const qq = req.body.qq || '';
  const location = req.body.location || '';
  const signature = req.body.signature || '';
  const avatar = req.body.avatar || '';

  const data = {
    weixin,
    qq,
    location,
    signature,
    avatar
  };

  try {
    const doc = await db.updateById(User)(req.user._id)(data);
    req.user = doc.toObject({ virtual: true });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const block = async (req, res, next) => {
  const userId = req.body.userId;
  const action = req.body.action;

  try {
    await db.updateById(User)(userId)({
      isBlock: action === 'block'
    });
    res.end();
  } catch (err) {
    next(err);
  }
};

export const users = async (req, res, next) => {
  try {
    const currentPage = parseInt(req.body.currentPage, 10) || 1;
    const limit = config.postListCount;

    const options = {
      skip: (currentPage - 1) * limit,
      limit,
      sort: '-createAt'
    };

    const pages = await getPages(db.count(User))({});
    const users = await db.find(User)({})(options);
    res.json({ users, pages, currentPage });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  const userId = req.body.userId || '';
  const role = req.body.role || 'N';

  try {
    await db.updateById(User)(userId)({ role });
    res.end();
  } catch (err) {
    next(err);
  }
};
