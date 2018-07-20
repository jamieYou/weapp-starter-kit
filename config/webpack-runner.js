const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const webpack = require('webpack')

module.exports = function runWebpack() {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  const config = {
    mode: NODE_ENV === 'development' ? 'development' : 'production',
    target: 'node',
    entry: {
      index: path.resolve('src/lib.js'),
    },
    output: {
      path: path.resolve('dist/lib'),
      libraryTarget: 'umd',
      library: 'lib',
      filename: '[name].js',
    },
    devtool: false,
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      })
    ],
    module: {
      rules: [
        { test: /\.js$/, use: ['babel-loader'], exclude: /node_modules/ },
      ],
    },
  }

  return new Promise((resolve, reject) => {
    const spinner = ora('building...')
    spinner.start()

    webpack(config).run((error, stats) => {
      spinner.stop()
      if (error) return reject(error)

      const jsonStats = stats.toJson()
      if (jsonStats.errors.length) {
        jsonStats.errors.forEach(error => console.log(chalk.red(error)))
        return reject(new Error('webpack build has error'))
      }
      if (jsonStats.warnings.length) {
        console.log(chalk.yellow('Webpack generated the following warnings: '))
        jsonStats.warnings.forEach(warning => console.log(chalk.yellow(warning)))
      }

      console.log(stats.toString({
        colors: true,
        hash: false,
        version: true,
        children: false,
        chunks: false,
        modules: false,
        chunkModules: false
      }))
      resolve()
    })
  })
}
