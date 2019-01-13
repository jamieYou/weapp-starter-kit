function randomString() {
  return 'c' + Math.random().toString(36).substr(2, 5)
}

function parseMustache(str = '') {
  str = [].concat(str).join(' ')
  const reg = /{{((?!{{).)+}}/g
  const list = str.match(reg)

  if (list) {
    const codes = []
    list.reduce((text, word) => {
      const index = text.indexOf(word)
      codes.push(
        text.slice(0, index),
        text.slice(index, word.length + index)
      )
      return text.slice(word.length + index)
    }, str)
    return codes.filter(Boolean).map(v => {
      const result = v.replace(/{{/, '(').replace(/}}/, ')')
      return v === result ? JSON.stringify(v) : result
    }).join('+')
  }
}

function parseContext(str) {
  const mustache = parseMustache(str) || void 0
  const context_id = mustache ? `context.${randomString()}` : void 0
  return { mustache, context_id }
}

module.exports = {
  parseMustache,
  parseContext,
}
