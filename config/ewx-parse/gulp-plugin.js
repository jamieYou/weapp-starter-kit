const path = require('path')
const fs = require('fs-extra')
const through = require('through2')
const main = require('./index')

module.exports = function () {
  return through.obj(
    function (file, encoding, cb) {
      if (file.isNull()) return cb(null, file)
      try {
        const { wxml, render } = main(file.contents.toString())
        file.contents = Buffer.from(wxml, 'utf-8')
        this.push(file)
        const dir = path.dirname(file.path).replace(path.resolve('src'), path.resolve('dist'))
        const filename = 'ewx-render.js'
        fs.outputFileSync(path.join(dir, filename), render)
        cb()
      } catch (err) {
        err.fileName = file.path
        err.plugin = 'gulp-ewx'
        this.emit('error', err)
      }
    }
  )
}
