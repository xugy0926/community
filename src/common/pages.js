import R from 'ramda';
import * as cache from './cache';
import { postListCount } from '../config';

const pagesCount = R.divide(R.__, postListCount);

export default R.curry(async function(fn, keyString, query) {
  const key = JSON.stringify(query) + keyString;

  try {
    let count = await cache.get(key).then(count => {
      if (count) return pagesCount(count);
      else return count;
    });
    if (typeof count !== 'undefined' && count) return count;

    count = await fn(query)({});
    await cache.set(key, 60, count);
    return pagesCount(count);
  } catch (err) {
    return 0;
  }
});
