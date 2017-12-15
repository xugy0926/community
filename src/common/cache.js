import redis from './redis';

export function get(key) {
  return redis.getAsync(key);
}

export function set(key, expire, value) {
  return redis.setex(key, expire, value);
}
