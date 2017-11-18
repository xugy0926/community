import util from 'util';
import mailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import path from 'path';
import ejs from 'ejs';
import { readFileSync } from 'fs';
import logger from './logger';
import config from '../config';
import markdown from '../common/markdown';

const transporter = mailer.createTransport(smtpTransport(config.email));
const SITE_ROOT_URL = `${config.api.clientUrl}/${config.apiPrefix.page}`;

export function sendReplyNotify(fromUser, toUser, post, reply) {
  const subject = `${fromUser.loginname}评论了${post.title}`;
  const content =
    `${fromUser.loginname}在<a href="${SITE_ROOT_URL}post/${post._id}">${post.title}</a>中回复了您，回复内容请参考下面。`;

  const str = readFileSync(
    path.join(__dirname, '../views/email/upReply.ejs'),
    'utf8',
  );
  const html = ejs.compile(str)({
    toName: toUser.loginname,
    content,
    htmlContent: markdown(reply.content)
  });

  sendMail({
    to: toUser.email,
    subject,
    html
  });  
}

export function sendUpReplyNotify(fromUser, toUser, post, reply) {
  const subject = `${fromUser.loginname}点赞了你下面的回复`;
  const content =
    `${fromUser.loginname}在<a href="${SITE_ROOT_URL}post/${post._id}">${post.title}</a>中点赞了您的回复。`;
  
  const str = readFileSync(
    path.join(__dirname, '../views/email/upReply.ejs'),
    'utf8',
  );
  const html = ejs.compile(str)({
    toName: toUser.loginname,
    content,
    htmlContent: markdown(reply.content)
  });

  sendMail({
    to: toUser.email,
    subject,
    html
  });
}

export function sendMail(data) {
  const from = util.format('%s <%s>', config.name, config.email.auth.user);
  data.from = from;
  // 遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
  transporter.sendMail(data, err => {
    if (err) {
      // 写为日志
      logger.error(err);
    }
  });
}

export function sendActiveMail(who, token, loginname) {
  const to = who;
  const subject = `${config.name}社区帐号激活`;
  const html =
    `<p>您好：${loginname}</p>` +
    `<p>我们收到您在${config.name}社区的注册信息，请点击下面的链接来激活帐户：</p>` +
    `<a href  = "${SITE_ROOT_URL}user/activeAccount?key=${token}&name=${loginname}">激活链接</a>` +
    `<p>若您没有在${config.name}社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>` +
    `<p>${config.name}社区 谨上。</p>`;
  sendMail({
    to,
    subject,
    html
  });
}

export function sendResetPassMail(who, token, loginname) {
  const to = who;
  const subject = `${config.name}社区密码重置`;
  const html =
    `<p>您好：${loginname}</p>` +
    `<p>我们收到您在${config.name}社区重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>` +
    `<a href="${SITE_ROOT_URL}password/inputFromMail?key=${token}&loginname=${loginname}">重置密码链接</a>` +
    `<p>若您没有在${config.name}社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>` +
    `<p>${config.name}社区 谨上。</p>`;

  sendMail({
    to,
    subject,
    html
  });
}
