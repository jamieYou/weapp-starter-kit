const path = require('path')
const fs = require('fs-extra')
const { html2json, json2html } = require('html2json')
const _ = require('lodash')
const { minify } = require('html-minifier')
const prettier = require('prettier')
const { parseContext, parseMustache, resetVarName } = require('./parse-mustache')
const parseCodeBinding = require('./parse-code-binding')

function instructRender(attr = {}, tag_name) {
  let render = _.template('<%= code %>')

  if (attr['wx:for']) {
    const item_name = _.get(attr, 'wx:for-item', 'item')
    const index_name = _.get(attr, 'wx:for-index', 'index')
    const { mustache = JSON.parse(attr['wx:for']), context_id } = parseContext(attr['wx:for'])
    attr['wx:for'] = `{{${context_id}}}`
    render = _.template(`${context_id} = ewxForEach(${mustache}, (${item_name}, ${index_name}, $ctx)=> { <%= code %> })`)
    attr['wx:for-item'] = '$ctx'
  }

  if (attr['wx:if']) {
    const { mustache = JSON.parse(attr['wx:if']), context_id } = parseContext(attr['wx:if'])
    attr['wx:if'] = `{{${context_id}}}`
    render = _.template(render({ code: `if(${context_id} = ${mustache}) { <%= code %> }` }))
  } else if (attr['wx:elif']) {
    const { mustache = JSON.parse(attr['wx:elif']), context_id } = parseContext(attr['wx:elif'])
    attr['wx:elif'] = `{{${context_id}}}`
    render = _.template(`else if(${context_id} = ${mustache}) { <%= code %> }`)
  } else if ('wx:else' in attr) {
    render = _.template('else { <%= code %> }')
  }

  const other_props = _.omit(attr, ['wx:if', 'wx:elif', 'wx:else', 'wx:for', 'wx:for-item', 'wx:for-index'])

  return {
    render,
    codes: _.map(other_props, (value, key) => {
      const { mustache, context_id } = parseContext(attr[key])
      if (mustache) {
        if (tag_name === 'template' && key === 'data') attr[key] = `{{...${context_id}}}`
        else attr[key] = `{{${context_id}}}`

        if (isEvent(key)) return `${context_id} = ewxParseEvent(${mustache})`
        return `${context_id} = ${mustache}`
      }
      return ''
    }).filter(Boolean)
  }
}

function each(child) {
  return child.reduce((results, item) => {
    if (item.node === 'element') {
      if (item.tag === 'script') {
        results.push(item.child.map(v => v.text))
        delete item.tag
        delete item.child
        item.node = 'text'
        item.text = ''
      } else {
        const { render, codes } = instructRender(item.attr, item.tag)
        if (item.child && item.tag !== 'template') {
          codes.push(...each(item.child))
        }
        const result = render({ code: codes.join('\n') })
        results.push(result)
      }
    } else {
      const codes = parseMustache(item.text)
      if (codes.length) {
        item.text = codes.map(value => {
          if (/^{{.+}}$/g.test(value)) {
            const { mustache, context_id } = parseContext(value)
            results.push(`${context_id} = ewxParseText(${mustache})`)
            return `{{${context_id}}}`
          }
          return value
        }).join('')
      }
    }

    return results
  }, [])
}

function isEvent(attr_key) {
  return /^(bind|catch|capture-bind|capture-catch)/i.test(attr_key)
}

function parseWxs(wxml) {
  const reg = /{%((?!{%).)+%}/g
  return wxml.replace(reg, word => {
    return word.replace(/{{/g, '').replace(/}}/g, '').replace(/{%/, '{{').replace(/%}/, '}}')
  })
}

function waitContext(wxml) {
  return `<block wx:if="{{$ctx}}">${wxml}</block>`
}

module.exports = function (file, wxml) {
  resetVarName()
  const html = minify(wxml, { removeComments: true, keepClosingSlash: true })
  const json = html2json(html)
  const code = each(json.child).join(';')
  const render = parseCodeBinding(
    `module.exports = function render(){const $ctx = {}; ${code}; return $ctx }`
  )
  const result = prettier.format(render, { parser: 'babylon' })
  const dir = path.dirname(file.path).replace(path.resolve('src'), path.resolve('dist'))
  const filename = 'ewx-render.js'
  fs.outputFileSync(
    path.join(dir, filename),
    result
  )
  return waitContext(parseWxs(json2html(json)))
}
