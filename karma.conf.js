module.exports = (config) => config.set({
  browsers: ['Chrome', 'PhantomJS'],
  frameworks: ['mocha'],
  files: [
    'modules/**/__tests__/*-test.js'
  ],
  preprocessors: {
    'modules/**/__tests__/*-test.js': ['webpack', 'sourcemap']
  },
  singleRun: true,
  reporters: ['dots'],
  webpack: {
    devtool: 'inline-source-map',
    watch: true,
    // externals and and resolve are required for enzyme to work
    externals: {
      jsdom: 'window',
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window',
      'text-encoding': 'window'
    },
    resolve: {
      alias: {
        sinon: 'sinon/pkg/sinon'
      }
    },
    module: {
      loaders: [
        { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' },
        // json and sinon loaders are required for enzyme to work
        { test: /\.json$/, loader: 'json' },
        { test: /sinon\.js$/, loader: 'imports?define=>false,require=>false' }
      ]
    }
  },
  webpackMiddleware: {
    noInfo: true
  },
  phantomjsLauncher: {
    // Have phantomjs exit if a ResourceError is encountered
    // (useful if karma exits without killing phantom)
    exitOnResourceError: true
  }
});
