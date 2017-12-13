import redis from './redis';
import logger from './logger';

export function get(key) {
  return redis.getAsync(key);
}

export function set(key, expire, value) {
  return redis.setex(key, expire, value);
}
