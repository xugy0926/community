import mongoose from 'mongoose';
import config from '../config';

mongoose.Promise = global.Promise;

export default function () {
  return new Promise(function (resolve, reject) {
    const db = mongoose.connect(config.mongodb.url, {
      useMongoClient: true
      /* other options */
    });

    db.on('error', function (err) {
      reject(err);
    });

    db.once('open', function() {
      resolve();
    });
  });
}
