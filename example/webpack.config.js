var getConfig = require('hjs-webpack');


module.exports = getConfig({
  // entry point for the app
  in: __dirname + '/index.js',
  out: __dirname + '/public',
});
