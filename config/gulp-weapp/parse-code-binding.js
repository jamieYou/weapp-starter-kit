const babel = require('@babel/core')

const g_list = ['Promise', 'Array', 'Object', 'Function', 'String', 'Number', 'Boolean', 'Symbol', 'module', 'wx']

function undeclaredVariable() {
  return {
    visitor: {
      ReferencedIdentifier(path) {
        const { node, scope } = path
        if (!scope.getBinding(node.name) && !g_list.includes(node.name)) {
          node.name = `this.${node.name}`
        }
      }
    }
  }
}

module.exports = function parseCodeBinding(code) {
  return babel.transformSync(code, {
    configFile: false,
    plugins: [undeclaredVariable]
  }).code
}
