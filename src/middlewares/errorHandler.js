import config from '../config';

export default function (err, req, res, next) {
  const errorDetails = err.stack || err;
  console.error('Yay', errorDetails);
  const errorCode = err.status || 500;

  if (req.method === 'GET' && errorCode === 401) {
    return res.redirect('/signin');
  }

  if (req.method === 'GET' && errorCode === 403) {
    return res.send(`<h1>需要管理员权限</h1>\n`);
  }

  // render the error page
  res.status(errorCode).format({
    json() {
      const errorInfo = {
        details: config.isProduction ? null : err,
        error: err.toString(),
      };
      res.send(errorInfo);
    },

    html() {
      const message = config.isProduction
        ? '<p>Something went wrong</p>'
        : `<pre>${errorDetails}</pre>`;

      res.send(`<h1>500 Internal server error</h1>\n${message}`);
    },

    default() {
      const message = config.isProduction
        ? 'Something went wrong'
        : `${errorDetails}`;

      res.send(`500 Internal server error:\n${message}`);
    },
  });
}