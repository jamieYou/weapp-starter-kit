const through = require('through2')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const PluginError = require('plugin-error')
const babel = require('@babel/core')
const { plugin, imports } = require('./babel-plugins')
const runWebpack = require('./webpack-runner')

function wxBabel() {
  return through.obj(
    function (file, encoding, cb) {
      if (file.isNull()) return cb(null, file)

      const opts = {
        filename: file.path,
        filenameRelative: file.relative,
        sourceMap: Boolean(file.sourceMap),
        sourceFileName: file.relative,
        plugins: [plugin]
      }

      babel.transformAsync(file.contents.toString(), opts)
        .then(res => {
          file.contents = Buffer.from(res.code, 'utf-8')
          this.push(file)
        })
        .catch(err => {
          this.emit('error', new PluginError('gulp-wx-babel', err, {
            fileName: file.path,
            showProperties: true
          }))
        })
        .finally(cb)
    },

    async function (cb) {
      if (!imports.hasNewImports) return cb()
      try {
        let str = ''
        _.forEach(imports.myImports, ({ name }, source) => str += `exports.${name} = require('${source}');`)
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
  const p = path.resolve('dist/lib.js')
  const code = fs.readFileSync(p, 'utf-8')
  fs.writeFileSync(p, `new Function('return this')().__proto__ = this;${code}`)
}

module.exports = wxBabel
