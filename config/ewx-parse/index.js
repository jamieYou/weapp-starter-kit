const { html2json, json2html } = require('html2json')
const _ = require('lodash')
const { minify } = require('html-minifier')
const prettier = require('prettier')
const cheerio = require('cheerio')
const { parseMustache, toMustache, setAttrToStr } = require('./parse-mustache')
const parseCodeBinding = require('./parse-code-binding')

let var_name = 0

function getName() {
  var_name++
  return 'var_' + var_name.toString(16)
}

function instructRender(attr = {}) {
  let render = _.template('<%= code %>')

  if (attr['wx:for']) {
    const item_name = _.get(attr, 'wx:for-item', 'item')
    const index_name = _.get(attr, 'wx:for-index', 'index')
    const [{ type, expression }] = parseMustache(attr['wx:for'])
    let name1 = type === 'CallExpression' ? getName() : ''
    const name2 = getName()
    const template = type === 'CallExpression'
      ? `ewxForEach($set($ctx, '${name1}', ${expression}), (${item_name}, ${index_name}, $ctx)=> { <%= code %> })`
      : `ewxForEach(${expression}, (${item_name}, ${index_name}, $ctx)=> { <%= code %> })`
    render = _.template(`$set($ctx, '${name2}', ${template});`)
    if (type === 'CallExpression') attr['wx:for'] = `{{ <%= $ctx %>.${name1} }}`
    attr['wx:ctx'] = `${name2}[${index_name}]`
  }

  // if (attr['wx:if']) {
  //   const [{ type, expression }] = parseMustache(attr['wx:if'])
  //   if (type === 'CallExpression') {
  //     const name = `$ctx.${getName()}`
  //     attr['wx:if'] = name
  //     render = _.template(render({ code: `if(${name} = ${expression}) { <%= code %> }` }))
  //   } else {
  //     render = _.template(render({ code: `if(${expression}) { <%= code %> }` }))
  //   }
  // } else if (attr['wx:elif']) {
  //   const [{ type, expression }] = parseMustache(attr['wx:elif'])
  //   if (type === 'CallExpression') {
  //     const name = `$ctx.${getName()}`
  //     attr['wx:elif'] = name
  //     render = _.template(`else if(${name} = ${expression}) { <%= code %> }`)
  //   } else {
  //     render = _.template(`else if(${expression}) { <%= code %> }`)
  //   }
  // } else if ('wx:else' in attr) {
  //   render = _.template('else { <%= code %> }')
  // }

  const other_props = _.omit(attr, ['wx:if', 'wx:elif', 'wx:else', 'wx:for', 'wx:for-item', 'wx:for-index'])
  const codes = []

  _.forEach(other_props, (value, key) => {
    _.forEach(toMustache(attr[key]), v => {
      if (isEvent(key)) {
        const expression = v.replace(/^{{/, '').replace(/}}$/, '')
        const name = getName()
        codes.push(
          `$set($ctx, '${name}', ewxParseEvent(${expression}));`
        )
        attr[key] = attr[key].replace(expression, `<%= $ctx %>.${name}`)
      } else {
        const expressions = parseMustache(v)
        expressions.forEach(({ type, expression }) => {
          if (type === 'CallExpression') {
            const name = getName()
            codes.push(
              `$set($ctx, '${name}', ${expression});`
            )
            attr[key] = attr[key].replace(expression, `<%= $ctx %>.${name}`)
          }
        })
      }
    })
  })

  return {
    render,
    codes,
  }
}

function each(child) {
  return child.reduce((results, item) => {
    if (item.node === 'element') {
      setAttrToStr(item.attr)
      const { render, codes } = instructRender(item.attr)
      if (item.child && item.tag !== 'template') {
        codes.push(...each(item.child))
      }
      const result = render({ code: codes.join('\n') })
      results.push(result)
    } else {
      _.forEach(toMustache(item.text), v => {
        const expressions = parseMustache(v)
        expressions.forEach(({ type, expression }) => {
          if (type === 'CallExpression') {
            const name = getName()
            results.push(
              `$set($ctx, '${name}', ${expression});`
            )
            item.text = item.text.replace(expression, `<%= $ctx %>.${name}`)
          }
        })
      })
    }

    return results
  }, [])
}

function isEvent(attr_key) {
  return /^(bind|catch|capture-bind|capture-catch)/i.test(attr_key)
}

module.exports = function (wxml) {
  const html = minify(wxml, { removeComments: true, keepClosingSlash: true, caseSensitive: true })
  const json = html2json(html)
  const code = each(json.child).join('\n')
  const render = parseCodeBinding(
    `module.exports = function render(){const $ctx = {}; ${code}; return $ctx }`
  )
  const result = prettier.format(render, { parser: 'babylon' })

  let t = json2html(json)
  t = '<% var $ctx = "$ctx" %>' + t
  const $ = cheerio.load(t, { decodeEntities: false })
  $('[wx\\:for]').each(function () {
    $(this).before('<% (function ($ctx){ %>')
    $(this).after(`<% })($ctx + '.${$(this).attr('wx:ctx')}') %>`)
    $(this).removeAttr('wx:ctx')
  })

  return {
    wxml: _.template($('body').html())(),
    render: result,
  }
}
