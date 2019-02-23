const path = require('path')
const fs = require('fs')
const _ = require('lodash')

const imports = {
  myImports: {},
  hasNewImports: false,
  createName() {
    return '$p' + _.size(this.myImports)
  }
}

function handle(nodePath, state) {
  if (nodePath.node.callee.name === 'require') {
    const value = _.get(nodePath, 'node.arguments[0].value')
    if (!value) return
    let is_npm_module = false
    if (value in imports.myImports) is_npm_module = true
    else if (!/^(\.|\/)/.test(value)) {
      imports.myImports[value] = { name: imports.createName() }
      imports.hasNewImports = true
      is_npm_module = true
    }
    if (is_npm_module) {
      const lib_path = path.relative(path.dirname(state.file.opts.filename), path.resolve('src/lib.js')).replace(/\\/g, '/').replace(/^lib/, './lib')
      nodePath.replaceWithSourceString(`require("${lib_path}").${imports.myImports[value].name}`)
    } else {
      const index_path = path.join(path.dirname(state.file.opts.filename), value, 'index.js')
      if (fs.existsSync(index_path)) {
        nodePath.node.arguments[0].value = path.join(value, 'index.js').replace(/\\/g, '/')
      }
    }
  }
}

exports.imports = imports
exports.plugin = function () {
  return {
    visitor: {
      CallExpression: handle
    }
  }
}
