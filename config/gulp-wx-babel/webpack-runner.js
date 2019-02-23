const ora = require('ora')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../../webpack.config')

module.exports = function runWebpack() {
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
