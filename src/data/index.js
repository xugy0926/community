import mongoose from 'mongoose';
import config from '../config';

mongoose.Promise = global.Promise;

export default function () {
  return Promise.resolve().then(() => {
    mongoose.connect(config.mongodb.url, {
      useMongoClient: true
      /* other options */
    });
  });
}
