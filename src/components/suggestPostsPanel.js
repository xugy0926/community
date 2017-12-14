import _ from 'lodash';
import path from 'path';
import ejs from 'ejs';
import { readFileSync } from 'fs';
import * as db from '../data/db';
import User from '../data/models/user';
import Post from '../data/models/post';

export default async function(zone) {
  if (!zone) throw new Error('zone is null');

  const conditions = { zoneId: zone._id, good: false };
  const options = { limit: 10, sort: '_createAt' };
  const posts = await db.find(Post)(conditions, options);

  const authorIds = [];
  posts.forEach(item => {
    if (item.authorId) authorIds.push(item.authorId.toString());
  });

  const authors = await db.find(User)({ _id: { $in: authorIds } }, {});
  posts.forEach(item => {
    item.toObject();
    const index = _.findIndex(
      authors,
      i => i._id.toString() === item.authorId.toString()
    );

    if (index >= 0) {
      item.author = authors[index];
    }
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
