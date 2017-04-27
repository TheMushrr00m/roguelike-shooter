const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const defaultWebpack = require('./webpack.config.js');

const definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
});


module.exports = Object.assign({}, defaultWebpack, {
  devtool: false,
  watch: false,
  plugins: [
    definePlugin,
    new webpack.optimize.UglifyJsPlugin({
      drop_console: true,
      minimize: true,
      output: {
        comments: false,
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.bundle.js' }),
    new HtmlWebpackPlugin({
      title: 'Custom template',
      hash: true,
      template: 'index.ejs', // Load a custom template (ejs by default see the FAQ for details)
    }),
  ],
});
