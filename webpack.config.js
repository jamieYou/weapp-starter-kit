const path = require('path')
const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  mode: NODE_ENV === 'development' ? 'development' : 'production',
  target: 'node',
  entry: path.resolve('lib.js'),
  output: {
    path: path.resolve('dist'),
    libraryTarget: 'commonjs2',
    filename: 'lib.js',
  },
  devtool: false,
  resolve: {
    alias: {
      '@': path.resolve('src')
    }
  },
  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'], exclude: /node_modules/ },
    ],
  }
}
