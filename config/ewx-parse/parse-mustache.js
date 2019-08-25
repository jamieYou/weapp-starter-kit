const babel = require('@babel/core')
const _ = require('lodash')

function setAttrToStr(attr) {
  _.forEach(attr, (v, key) => {
    attr[key] = [].concat(v).join(' ')
  })
}

function toMustache(text) {
  const reg = /{{((?!{{).)+}}/g
  return text.match(reg)
}

function parseMustache(text) {
  const code = text.replace(/^{{/, '').replace(/}}$/, '')
  const result = []
  babel.transformSync(code, {
    configFile: false,
    plugins: [
      function plugin() {
        return {
          visitor: {
            Identifier(nodePath) {
              result.push({ type: 'MemberExpression', expression: nodePath.toString() })
              nodePath.shouldSkip = true
            },
            MemberExpression(nodePath) {
              result.push({ type: 'MemberExpression', expression: nodePath.toString() })
              nodePath.shouldSkip = true
            },
            CallExpression(nodePath) {
              result.push({ type: 'CallExpression', expression: nodePath.toString() })
              nodePath.shouldSkip = true
            }
          }
        }
      }
    ]
  })

  return result
}

module.exports = { parseMustache, toMustache, setAttrToStr }
