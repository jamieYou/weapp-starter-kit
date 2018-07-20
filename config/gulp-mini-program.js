const through = require('through-gulp')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const runWebpack = require('./webpack-runner')

function miniProgram(settings) {
  function replaceContent(file, content) {
    _.forEach(settings, (item, key) => {
      content = content.replace(new RegExp(`process\\.env\\.${key}`, 'g'), JSON.stringify(item))
    })
    return content
  }

  //通过through创建流stream
  return through(
    function (file, encoding, callback) {
      //进程文件判断
      if (file.isNull()) {
        throw 'NO Files,Please Check Files!'
      }
      //buffer对象可以操作
      if (file.isBuffer()) {
        //拿到单个文件buffer
        const content = file.contents.toString('utf-8')
        file.contents = new Buffer(replaceContent(file, content), 'utf-8')
      }
      //stream流是不能操作的,可以通过fs.readFileSync
      if (file.isStream()) {
        //同步读取
        const content = fs.readFileSync(file.path).toString('utf-8')
        file.contents = new Buffer(replaceContent(file, content), 'utf-8')
      }
      this.push(file)
      callback()
    },
    async function (cb) {
      if (!global.__hasNewImports) return cb()
      try {
        let str = ''
        await Promise.all(_.map(global.__myImports, async ({ name }, source) => {
          str += `exports.${name} = require('${source}');`
          const sourcePath = path.resolve(`dist/lib/${source}.js`)
          const libPath = path.relative(path.dirname(sourcePath), path.resolve('dist/lib/index.js'))
          const file = `module.exports=require('${libPath}').${name}`
          await fs.outputFile(sourcePath, file)
        }))
        await fs.writeFile(path.resolve('src/lib.js'), str)
        await runWebpack()
        global.__hasNewImports = false
        cb()
      } catch (err) {
        err.plugin = 'gulp-mini-program'
        this.emit('error', err)
      } finally {
        await fs.remove(path.resolve('src/lib.js'))
      }
    },
  )
}

const libCode = `
const self = Function('return this')()
self.Promise = Promise
self.Array = Array
self.Object = Object
self.Function = Function
self.String = String
self.Number = Number
self.Math = Math
require('core-js/modules/es7.promise.finally')
require('babel-polyfill')
;
`

// exporting the plugin
module.exports = miniProgram
