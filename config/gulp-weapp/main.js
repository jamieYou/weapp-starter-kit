const path = require('path')
const fs = require('fs-extra')
const { html2json, json2html } = require('html2json')
const _ = require('lodash')
const { minify } = require('html-minifier')
const prettier = require('prettier')
const { parseContext } = require('./parse-mustache')
const parseCodeBinding = require('./parse-code-binding')

function instructRender(attr = {}, tag_name) {
  let render = _.template('<%= code %>')

  if (attr['wx:if']) {
    const { mustache = JSON.parse(attr['wx:if']), context_id } = parseContext(attr['wx:if'])
    attr['wx:if'] = `{{${context_id}}}`
    render = _.template(`if(${context_id} = ${mustache}) { <%= code %> }`)
  }

  else if (attr['wx:elif']) {
    const { mustache = JSON.parse(attr['wx:elif']), context_id } = parseContext(attr['wx:elif'])
    attr['wx:elif'] = `{{${context_id}}}`
    render = _.template(`else if(${context_id} = ${mustache}) { <%= code %> }`)
  }

  else if (attr['wx:else']) {
    render = _.template('else { <%= code %> }')
  }

  if (attr['wx:for']) {
    const item_name = _.get(attr, 'wx:for-item', 'item')
    const index_name = _.get(attr, 'wx:for-index', 'index')
    const { mustache = JSON.parse(attr['wx:for']), context_id } = parseContext(attr['wx:for'])
    attr['wx:for'] = `{{${context_id}}}`
    render = _.template(
      render({
        code: `${context_id} = wxForEach(${mustache}, (${item_name}, ${index_name}, context)=> { <%= code %> })`
      })
    )
    attr['wx:for-item'] = 'context'
  }

  const other_props = _.omit(attr, ['wx:if', 'wx:elif', 'wx:else', 'wx:for', 'wx:for-item', 'wx:for-index'])

  return {
    render,
    codes: _.map(other_props, (value, key) => {
      const { mustache, context_id } = parseContext(attr[key])
      if (mustache) {
        if (tag_name === 'template' && key === 'data') attr[key] = `{{...${context_id}}}`
        else attr[key] = `{{${context_id}}}`
        return `${context_id} = ${mustache}`
      }
      return ''
    }).filter(Boolean)
  }
}

function each(child) {
  return child.reduce((results, item) => {
    if (item.node === 'element') {
      const { render, codes } = instructRender(item.attr, item.tag)
      if (item.child) {
        codes.push(...each(item.child))
      }
      const result = render({ code: codes.join(';') })
      results.push(result)
    }

    else {
      const { mustache, context_id } = parseContext(item.text)
      if (mustache) {
        item.text = `{{${context_id}}}`
        results.push(`${context_id} = ${mustache}`)
      }
    }

    return results
  }, [])
}

module.exports = function (file, wxml) {
  const html = minify(wxml, { collapseWhitespace: true, removeComments: true, keepClosingSlash: true })
  const json = html2json(html)
  const code = each(json.child).join(';')
  const render = parseCodeBinding(
    `module.exports = function render(){const context = {}; ${code}; return context }`
  )
  const result = prettier.format(render, { parser: 'babylon' })
  const dir = path.dirname(file.path).replace(path.resolve('src'), path.resolve('dist'))
  const filename = 'weapp-render.js'
  fs.outputFileSync(
    path.join(dir, filename),
    result
  )
  return json2html(json)
}