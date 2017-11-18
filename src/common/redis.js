import Redis from 'ioredis';
import logger from './logger';
import { redis } from '../config'

const client = new Redis({
  port: redis.port,
  host: redis.host,
  db: redis.db,
  password: redis.password,
});

client.on('error', err => {
  if (err) {
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
});

export default client;
