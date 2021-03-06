const path = require('path');
const webpack = require('webpack');

let extendedPath = path.resolve(__dirname, 'dist');
if (process.env.EXTERNAL_D3_C3) {
  extendedPath = `${extendedPath}/external_d3_c3/`;
}

const fileName = 'keen-dataviz';
const entry = ( process.env.TARGET !== 'node' ) ? './lib/browser.js' : './lib/server.js' ;

let definePluginVars = {};
if (process.env.NODE_ENV === 'development') {
  const demoConfig = require('../demo-config');
  definePluginVars = {
    webpackKeenGlobals: JSON.stringify({ demoConfig })
  };
}
definePluginVars.KEEN_GLOBAL_OBJECT = JSON.stringify(!process.env.EXTERNAL_D3_C3);

module.exports = {
  entry,

  target: process.env.TARGET ? `${process.env.TARGET}` : 'web',

  output: {
    path: extendedPath,
    filename: `${
      process.env.TARGET ? `${process.env.TARGET}/` : ''
    }${
      fileName
    }${
      process.env.OPTIMIZE_MINIMIZE ? '.min' : ''
    }.js`,
    library: `${!process.env.LIBRARY ? '' : process.env.LIBRARY}`,
    libraryTarget: 'umd',
  },

  module: {

    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, 'lib'),
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules'),
        ],
        loader: 'babel-loader',
      },

      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],

  },

  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: ['.js', '.json', '.jsx'],
  },

  optimization: {
    minimize: !!process.env.OPTIMIZE_MINIMIZE,
  },

  devtool: 'source-map',

  context: __dirname,

  // stats: 'verbose',

  plugins: [
    new webpack.DefinePlugin(definePluginVars),
  ],

  mode: process.env.NODE_ENV,

  devServer: {
    contentBase: path.join(__dirname, 'test/demo'),
    open: true,
    inline: true,
    hot: false,
    watchContentBase: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },

  externals: !process.env.EXTERNAL_D3_C3 ? {} : {
    c3: true,
    d3: true,
  },

};
