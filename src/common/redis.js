import bluebird from 'bluebird';
import redis from 'redis';
import logger from './logger';
import { redis as redisConfig } from '../config'

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  port: redisConfig.port,
  host: redisConfig.host,
  db: redisConfig.db,
  password: redisConfig.password,
});

client.on('ready', () => {
  logger.info('connect to redis.');
})

client.on('error', err => {
  logger.error('connect to redis error, check your redis config', err);
  process.exit(1);
});

export default client;
