import * as db from './db';
import Post from '../data/models/post';
import User from '../data/models/user';
import Zone from '../data/models/zone';

import * as at from '../common/at';

const distanceInWordsToNow = require('date-fns/distance_in_words_to_now')

export const fullPost = async id => {
  try {
    let post = await db.findOne(Post)({ _id: id }, {});
    if (!post) return Promise.reject('no post.');
    post = post.toObject();
    post.linkedContent = at.linkUsers(post.content);
    post.createAt = distanceInWordsToNow(post.createAt);
    post.updateAt = distanceInWordsToNow(post.updateAt);
    const author = await db.findOneById(User)(post.authorId);
    post.author = author;
    const zone = await db.findOneById(Zone)(post.zoneId);
    post.zone = zone;

    return Promise.resolve(post);
  } catch (err) {
    return Promise.reject(err);
  }
};