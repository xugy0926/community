import R from 'ramda';
import logger from './logger';
import * as db from '../data/db';
import User from '../data/models/user';
import * as Message from './message';

export const fetchUsers = (text) => {
  if (!text) {
    return [];
  }

  const ignoreRegexs = [
    /```.+?```/g, // 去除单行的 ```
    /^```[\s\S]+?^```/gm, // ``` 里面的是 pre 标签内容
    /`[\s\S]+?`/g, // 同一行中，`some code` 中内容也不该被解析
    /^ {4}.*/gm, // 4个空格也是 pre 标签，在这里 . 不会匹配换行
    /\b\S*?@[^\s]*?\..+?\b/g, // somebody@gmail.com 会被去除
    /\[@.+?\]\(\/.+?\)/g // 已经被 link 的 username
  ];

  ignoreRegexs.forEach(ignoreRegex => {
    text = text.replace(ignoreRegex, '');
  });

  const results = text.match(/@[a-z0-9\-_]+\b/gim);
  let names = [];
  if (results) {
    for (let i = 0, l = results.length; i < l; i++) {
      let s = results[i];
      // remove leading char @
      s = s.slice(1);
      names.push(s);
    }
  }
  names = R.uniq(names);
  return names;
}

export const sendMessageToMentionUsers = async (content, postId, authorId, replyId) => {
  if (!content || !authorId || !postId) {
    logger.debug(
      'sendMessageToMentionUsers'.red,
      `${postId}&${authorId}&${replyId}`
    );
    return;
  }

  replyId = !replyId ? null : replyId;

  const names = fetchUsers(content);

  if (names.length === 0) {
    return;
  }

  try {
    let users = await db.find(User)({ loginname: { $in: names } })({});
    if (users && users.length > 0) {
      users = users.filter(user => {
        if (!user) return false;
        !user._id.equals(authorId);
      });

      for (let i = 0; i < users.length; i++) {
        await Message.sendAtMessage(users[i]._id, authorId, postId, replyId);
      }
    }
  } catch (err) {
    logger.error(err);
  }
}

export const linkUsers = (text) => {
  const users = fetchUsers(text);
  for (let i = 0; i < users.length; i++) {
    const name = users[i];
    text = text.replace(
      new RegExp(`@${name}\\b(?!\\])`, 'g'),
      `[@${name}](/user/${name})`
    );
  }
  return text;
}
