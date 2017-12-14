import mongoose from 'mongoose';
import config from '../config';

mongoose.Promise = global.Promise;

export default function() {
  return new Promise((resolve, reject) => {
    mongoose.connect(config.mongodb.url, {
      useMongoClient: true
      /* other options */
    });

    resolve();
  });
}
