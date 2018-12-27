const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const imports = {
  myImports: {},
  hasNewImports: false,
}

function handle(babel_path, state) {
  const value = _.get(babel_path, 'node.source.value')
  if (!value) return
  let useNewValue = false
  if (value in imports.myImports) useNewValue = true
  else if (!/^(\.|\/)/.test(value)) {
    imports.myImports[value] = { name: _.camelCase(value) }
    imports.hasNewImports = true
    useNewValue = true
  }
  if (useNewValue) babel_path.node.source.value = path.relative(path.dirname(state.file.opts.filename), path.resolve(`src/lib/${value}`))
}

const babelrc = JSON.parse(
  fs.readFileSync(path.resolve('.babelrc'), 'utf-8')
)

babelrc.plugins.push(
  function () {
    return {
      visitor: {
        ImportDeclaration: handle,
        ExportDeclaration: handle,
      }
    }
  }
)

exports.imports = imports
exports.babelrc = babelrc
