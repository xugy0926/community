import config from '../config';

export default function (err, req, res, next) {
  console.error('Yay', err.stack);
  const errorCode = err.status || 500;

  if (req.method === 'GET' && errorCode === 401) {
    return res.redirect('/signin');
  }

  if (req.method === 'GET' && errorCode === 403) {
    return res.render('notify', { errorCode, message: '<p>需要管理员权限</p>' });
  }

  // render the error page
  res.status(errorCode).format({
    json() {
      const errorInfo = {
        details: config.isProduction ? null : err,
        error: err.name + ':' + err.message,
      };
      
      res.json(errorInfo);
    },

    html() {
      const message = config.isProduction
        ? `<p>${err.name}:${err.message}</p>`
        : `<pre>${err.stack}</pre>`;

      res.render('notify', { errorCode, message });
    },

    default() {
      const message = config.isProduction
        ? `<p>${err.name}:${err.message}</p>`
        : `<pre>${err.stack}</pre>`;

      res.render('notify', { errorCode, message });
    },
  });
}