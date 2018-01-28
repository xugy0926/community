import R from 'ramda';
import config from '../config';
import Post from '../data/models/post';
import sm from 'sitemap';
import { sendMail } from '../common/mail';

export const index = async (req, res, next) => {
  const posts = await Post.find({ deleted: false }, '_id').limit(10000).exec();
  const urls = R.map(item => ({ url: `${config.api.clientUrl}/post/${item._id}` }), posts);
  const sitemap = sm.createSitemap({
    hostname: config.api.clientUrl,
    cacheTime: 600000, // 600 sec cache period
    urls
  });

  sendMail({
    to: config.admin.email,
    subject: 'good message.',
    html: 'Being crawled by a search engine.'
  });

  res.header('Content-Type', 'application/xml');
  res.send(sitemap.toString());
}