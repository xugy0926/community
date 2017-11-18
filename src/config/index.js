const isProduction = process.env.NODE_ENV === 'production' ? true : false;
let config = isProduction ? require('./index.pro') : require('./index.dev');
config.isProduction = isProduction;

module.exports = config;
