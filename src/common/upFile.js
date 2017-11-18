import utility from 'utility';
import path from 'path';
import fs from 'fs';
import qn from 'qn';
import config from '../config';

// 7牛 client
let qnClient = null;
if (config.qn.accessKey) {
  qnClient = qn.create(config.qn);
}

function localUp(file, options, callback) {
  const filename = options.filename;

  const newFilename =
    utility.md5(filename + String(new Date().getTime())) +
    path.extname(filename);

  const filePath = path.join(config.upload.path, newFilename);
  const fileUrl = config.upload.url + newFilename;

  file.on('end', () => {
    callback(null, {
      url: fileUrl,
    });
  });

  file.pipe(fs.createWriteStream(filePath));
}

export default function(file, options, callback) {
  if (qnClient) {
    qnClient.upload(file, options, callback);
  } else {
    localUp(file, options, callback);
  }
}
