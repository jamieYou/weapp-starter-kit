const _ = require('lodash')
const path = require('path')
global.__myImports = {}
global.__hasNewImports = false

function handle(babel_path, state) {
  const value = _.get(babel_path, 'node.source.value')
  if (!value) return
  let useNewValue = false
  if (value in global.__myImports) useNewValue = true
  else if (!/^(\.|\/)/.test(value)) {
    global.__myImports[value] = { name: _.camelCase(value) }
    global.__hasNewImports = true
    useNewValue = true
  }
  if (useNewValue) babel_path.node.source.value = path.relative(path.dirname(state.file.opts.filename), path.resolve(`src/lib/${value}`))
}

module.exports = function () {
  return {
    visitor: {
      ImportDeclaration: handle,
      ExportDeclaration: handle,
    }
  }
}
