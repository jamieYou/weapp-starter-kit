const _ = require('lodash')

let var_name_count = 0

function getVarName() {
  var_name_count++
  return 'var_' + var_name_count.toString(16)
}

function resetVarName() {
  var_name_count = 0
}

function parseMustache(str = '') {
  str = [].concat(str).join(' ')
  const reg = /{{((?!{{).)+}}/g
  const list = str.match(reg)
  const codes = []

  if (list) {
    const odd = list.reduce((text, word) => {
      const index = text.indexOf(word)
      codes.push(
        text.slice(0, index),
        text.slice(index, word.length + index)
      )
      return text.slice(word.length + index)
    }, str)
    codes.push(odd)
  }

  return _.compact(codes)
}

function joinMustache(str) {
  const codes = parseMustache(str)
  return codes.map(v => {
    const result = v.replace(/{{/, '(').replace(/}}/, ')')
    return v === result ? JSON.stringify(v) : result
  }).join('+')
}

function parseContext(str) {
  const var_name = getVarName()
  const mustache = joinMustache(str) || void 0
  const context_id = mustache ? `$ctx.${var_name}` : void 0
  return { mustache, context_id, var_name }
}

module.exports = {
  parseMustache,
  parseContext,
  resetVarName,
}
