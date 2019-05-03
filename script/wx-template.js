const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const program = require('commander')

program
  .version('0.0.1')
  .option('-p, --page', 'page 类型', false)
  .option('-n, --name <string>', '类名')
  .parse(process.argv)

const config = {
  dir: program.args[0] ? path.resolve(program.args[0]) : null,
  is_page: program.page,
  file_basename: _.kebabCase(program.name),
  get className() {
    return _.startCase(this.file_basename).replace(/\s/g, '')
  },
}

function getJSONFileOnDir(dir) {
  return path.join(dir, path.basename(dir) + '.json')
}

function usingComponent(file_basename, dir_of_json_file) {
  const p = program.args[0] ? getJSONFileOnDir(path.resolve(program.args[0])) : path.resolve('src/app.json')
  const obj = fs.existsSync(p) ? require(p) : {}
  _.set(obj, `usingComponents.${file_basename}`, path.relative(path.dirname(p), dir_of_json_file).replace(/\\/g, '/'))
  fs.outputFileSync(p, JSON.stringify(obj, null, 2) + '\n')
}

function setPage(file_basename) {
  const obj = require(path.resolve('src/app.json'))
  _.set(obj, `pages[${_.size(obj.pages)}]`, `pages/${file_basename}/${file_basename}`)
  fs.outputFileSync(path.resolve('src/app.json'), JSON.stringify(obj, null, 2) + '\n')
}

function create() {
  const dir = config.is_page ? path.resolve('src/pages') : (config.dir || path.resolve('src/components'))
  const { file_basename } = config
  const file_path = path.join(dir, file_basename, file_basename)

  fs.outputFileSync(file_path + '.js', getJSCode())
  fs.outputFileSync(
    file_path + '.json',
    JSON.stringify(config.is_page ? { usingComponents: {} } : { component: true }, null, 2) + '\n'
  )
  fs.outputFileSync(file_path + '.less', `.${file_basename} {\n\n}\n`)
  fs.outputFileSync(file_path + '.ewx', `<view class="${file_basename}">\n\n</view>\n`)

  if (config.is_page) setPage(file_basename)
  else usingComponent(file_basename, file_path)
}

function getJSCode() {
  const use_api = config.is_page ? 'createPage' : 'createComponent'

  return (
    `import { WeApp, ${use_api} } from '@/store'

@${use_api}(require)
export class ${config.className} extends WeApp {

}
`
  )
}

create()
