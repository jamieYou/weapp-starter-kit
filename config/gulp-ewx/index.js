const through = require('through2')
const main = require('./main')

module.exports = function () {
  return through.obj(
    function (file, encoding, cb) {
      if (file.isNull()) return cb(null, file)
      try {
        file.contents = Buffer.from(main(file, file.contents.toString()), 'utf-8')
        this.push(file)
        cb()
      } catch (err) {
        err.fileName = file.path
        err.plugin = 'gulp-ewx'
        this.emit('error', err)
      }
    }
  )
}
