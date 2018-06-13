const webpack = require('webpack')
const NODE_ENV = process.env.NODE_ENV || 'development'
const __DEV__ = NODE_ENV === 'development'
const path = require('path')

const srcPath = path.join(__dirname, '../src')
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
}

module.exports = {
  watch: __DEV__,
  target: 'node',
  entry: {
    index: path.join(srcPath, 'lib/index.js'),
  },
  output: {
    libraryTarget: 'umd',
    library: 'lib',
    filename: '[name].js',
  },
  plugins: [new webpack.DefinePlugin(GLOBALS)],
  module: {
    rules: [{ test: /\.js/, use: ['babel-loader'] }],
  },
}
