import path from 'path';
import ejs from 'ejs';
import { readFileSync } from 'fs';
import * as db from '../data/db';
import User from '../data/models/user';
import Post from '../data/models/post';
import conditionsIds from '../functions/conditionsIds';
import getObjById from '../functions/getObjById';
import props from '../functions/props';

export default async function(zone) {
  if (!zone) throw new Error('zone is null');

  const conditions = { zoneId: zone._id, good: false, status: 'P'};
  const options = { limit: 10, sort: '-createAt' };
  const posts = await db.find(Post)(conditions)(options);
  const authors = await db.find(User)(conditionsIds(props('authorId')(posts)))({});
  posts.forEach(item => {
    item.toObject();
    item.author = getObjById(item.authorId)(authors);
  });

  const str = readFileSync(
    path.join(__dirname, '../views/components/posts.ejs'),
    'utf8'
  );
  const suggestHtml = ejs.compile(str)({
    posts,
    title: '最新',
    zone: zone
  });

  return suggestHtml;
}
