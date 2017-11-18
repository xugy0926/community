import * as cache from './cache';

export default async function(fn, query, keyString) {
  const key = JSON.stringify(query) + keyString;

  try {
    let count = await cache.get(key);
    if (typeof count !== 'undefined' && count) return count;

    count = await fn(query);
    await cache.set(key, count, 60 * 1);
    return count;
  } catch (err) {
    return 0;
  }
}
