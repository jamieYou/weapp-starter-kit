const through = require('through2')
const path = require('path')
const PluginError = require('plugin-error')
const babel = require('@babel/core')
const { plugin, require_mask_reg } = require('./babel-plugins')

const app_js_path = path.join(process.cwd(), 'src', 'app.js')

function wxBabel() {
  return through.obj(
    function (file, encoding, cb) {
      if (file.isNull()) return cb(null, file)

      const opts = {
        filename: file.path,
        filenameRelative: file.relative,
        sourceMap: Boolean(file.sourceMap),
        sourceFileName: file.relative,
        configFile: false,
        plugins: [plugin],
      }

      babel.transformAsync(file.contents.toString(), opts)
        .then(res => {
          let code = res.code.replace(/"use strict";/g, '').replace(require_mask_reg, '')
          if (file.path === app_js_path) {
            code = `(function () {globalThis = this})();
            ${code}`
          }
          file.contents = Buffer.from(code, 'utf-8')
          this.push(file)
        })
        .catch(err => {
          this.emit('error', new PluginError('gulp-wx-babel', err, {
            fileName: file.path,
            showProperties: true
          }))
        })
        .finally(cb)
    }
  )
}

module.exports = wxBabel
