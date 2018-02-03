const through = require('through-gulp')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')

function miniProgram(settings, alias) {
  function replaceContent(file, content) {
    _.forEach(settings, (item, key) => {
      content = content.replace(new RegExp(`process\\.env\\.${key}`, 'g'), JSON.stringify(item))
    })
    _.forEach(alias, (real, fake) => {
      const reg = new RegExp(fake, 'g')
      if (reg.test(content)) {
        const requirePath = path.relative(file.dirname, real)
        content = content.replace(reg, requirePath)
      }
    })
    if (/regeneratorRuntime\./.test(content)) {
      const libPath = path.relative(
        file.dirname,
        path.resolve('src/lib/index.js')
      )
      content = content.replace(/regeneratorRuntime\./g, `require('${libPath.replace(/\\/g, '/')}').regeneratorRuntime.`)
    }
    return content
  }
  //通过through创建流stream
  return through(function (file, encoding, callback) {
    //进程文件判断
    if (file.isNull()) {
      throw "NO Files,Please Check Files!"
    }
    //buffer对象可以操作
    if (file.isBuffer()) {
      //拿到单个文件buffer
      const content = file.contents.toString("utf-8")
      file.contents = new Buffer(replaceContent(file, content), "utf-8")
    }
    //stream流是不能操作的,可以通过fs.readFileSync
    if (file.isStream()) {
      //同步读取
      const content = fs.readFileSync(file.path).toString("utf-8")
      file.contents = new Buffer(replaceContent(file, content), "utf-8")
    }
    this.push(file)
    callback()
  }, function (callback) {
    // just pipe data next, just callback to indicate that the stream's over
    callback()
  })
}
// exporting the plugin
module.exports = miniProgram
