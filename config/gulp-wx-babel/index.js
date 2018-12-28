const through = require('through2')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const babel = require('babel-core')
const { babelrc, imports } = require('./babel-config')
const runWebpack = require('./webpack-runner')

function wxBabel(define) {
  return through.obj(
    function (file, encoding, cb) {
      if (file.isNull()) return cb(null, file)

      try {
        babelrc.plugins.push(
          ['transform-define', _.mapKeys(define, (v, key) => `process.env.${key}`)]
        )
        const fileOpts = {
          filename: file.path,
          filenameRelative: file.relative,
          sourceMap: Boolean(file.sourceMap),
          sourceFileName: file.relative,
          sourceMapTarget: file.relative
        }
        const { code } = babel.transform(file.contents.toString(), {
          ...babelrc,
          ...fileOpts,
        })

        file.contents = Buffer.from(code, 'utf-8')
        this.push(file)
        cb()
      } catch (err) {
        err.fileName = file.path
        err.plugin = 'gulp-wx-babel'
        this.emit('error', err)
      }
    },

    async function (cb) {
      if (!imports.hasNewImports) return cb()
      try {
        let str = ''
        await Promise.all(_.map(imports.myImports, async ({ name }, source) => {
          str += `exports.${name} = require('${source}');`
          const sourcePath = path.resolve(`dist/lib/${source}.js`)
          const libPath = path.relative(path.dirname(sourcePath), path.resolve('dist/lib/index.js'))
          const file = `module.exports=require('${libPath}').${name}`
          await fs.outputFile(sourcePath, file)
        }))
        await fs.writeFile(path.resolve('lib.js'), str)
        await runWebpack()
        imports.hasNewImports = false
        addCodeInLib()
        cb()
      } catch (err) {
        err.plugin = 'gulp-wx-babel'
        this.emit('error', err)
      } finally {
        await fs.remove(path.resolve('lib.js'))
      }
    },
  )
}

function addCodeInLib() {
  const p = path.resolve('dist/lib/index.js')
  const code = fs.readFileSync(p, 'utf-8')
  fs.writeFileSync(p, `new Function('return this')().__proto__ = this;${code}`)
}

// exporting the plugin
module.exports = wxBabel
