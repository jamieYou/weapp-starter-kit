const path = require('path')
const _ = require('lodash')

const imports = {
  myImports: {},
  hasNewImports: false,
}

function handle(nodePath, state) {
  if (nodePath.node.callee.name === 'require') {
    const value = _.get(nodePath, 'node.arguments[0].value')
    if (!value) return
    let useNewValue = false
    if (value in imports.myImports) useNewValue = true
    else if (!/^(\.|\/)/.test(value)) {
      imports.myImports[value] = { name: _.camelCase(value) }
      imports.hasNewImports = true
      useNewValue = true
    }
    if (useNewValue) {
      nodePath.node.arguments[0].value = path.relative(path.dirname(state.file.opts.filename), path.resolve(`src/lib/${value}`))
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
