const path = require('path')
const babel = require('@babel/core')
const _ = require('lodash')
const fs = require('fs-extra')
const resolve = require('enhanced-resolve');
const { appENV } = require('../../config/env')

const myResolve = resolve.create.sync(require(path.resolve('webpack.config')).resolve);

const node_modules = {}
const src_path = path.join(process.cwd(), 'src')
const dist_path = path.join(process.cwd(), 'dist')
const node_modules_path = path.join(process.cwd(), 'node_modules')
const miniprogram_npm_path = path.join(dist_path, 'miniprogram_npm')
const require_mask_reg = new RegExp(', "gulp-wx-babel-done"', 'g')

function handle(nodePath, state) {
  if (nodePath.node.callee.name === 'require') {
    const file_path = state.file.opts.filename
    const require_path = _.get(nodePath, 'node.arguments[0].value')
    const status = _.get(nodePath, 'node.arguments[1].value')
    if (require_path && status !== 'gulp-wx-babel-done') {
      const absolutePath = myResolve(path.dirname(file_path), require_path)
      if (_.includes(file_path, src_path) && _.includes(absolutePath, node_modules_path)) {
        const require_module = absolutePath.replace(node_modules_path, '').replace(/\\/g, '/').replace(/^\//, '')
        nodePath.replaceWithSourceString(
          `require("${require_module}", "gulp-wx-babel-done")`
        )
      } else {
        const require_module = path.relative(path.dirname(file_path), absolutePath)
        nodePath.replaceWithSourceString(
          `require("${require_module.replace(/\\/g, '/')}", "gulp-wx-babel-done")`
        )
      }

      if (_.includes(absolutePath, node_modules_path)) {
        transformFileSync(absolutePath, opts)
      }
    }
  }
}

function transformFileSync(file_path, opts) {
  if (node_modules[file_path]) return
  const res = babel.transformFileSync(file_path, opts)
  const output_path = file_path.replace(node_modules_path, miniprogram_npm_path)
  fs.outputFileSync(output_path, res.code.replace(require_mask_reg, ''))
  node_modules[file_path] = output_path
}

const plugin = function () {
  return {
    visitor: {
      CallExpression: handle
    }
  }
}

const opts = {
  configFile: false,
  plugins: [[
    'transform-define',
    _.mapKeys(appENV, (v, key) => `process.env.${key}`)
  ],
    '@babel/plugin-transform-modules-commonjs',
    plugin
  ],
}

exports.plugin = plugin
exports.node_modules = node_modules
exports.require_mask_reg = require_mask_reg
