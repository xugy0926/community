import R from 'ramda';
import * as cache from './cache';
import { postListCount } from '../config';

export default R.curry(async function(fn, keyString, query) {
  const key = JSON.stringify(query) + keyString;

  try {
    let count = await cache.get(key).then(count => {
      if (count) return Math.ceil(count / postListCount);
      else return count;
    });
    if (typeof count !== 'undefined' && count) return count;

    count = await fn(query);
    await cache.set(key, 60, count);
    return Math.ceil(count / postListCount);
  } catch (err) {
    return 0;
  }
});
