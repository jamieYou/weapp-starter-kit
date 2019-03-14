const inquirer = require('inquirer')
const { exec } = require('child-process-promise')
const dayjs = require('dayjs')
const ora = require('ora')
const chalk = require('chalk')

const spinner = ora('building...')
const wxcli = '/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli'

const questions = [
  {
    type: 'list',
    name: 'env',
    message: '选择环境',
    choices: ['staging', 'production'],
  },
  {
    type: 'input',
    name: 'version',
    message: '版本号',
    default: dayjs().format('YY-MM-DD_HH:mm'),
  },
  {
    type: 'input',
    name: 'desc',
    message: '描述',
  },
]

async function run() {
  const { env, version, desc } = await inquirer.prompt(questions)
  spinner.start()
  const desc_str = desc ? `--upload-desc ${JSON.stringify(desc)}` : ''
  await exec(`NODE_ENV=${env} yarn build`)
  await exec(`${wxcli} -u ${version}@${process.cwd()} ${desc_str}`)
  console.log(chalk.green('\n上传成功'))
}

run().finally(() => spinner.stop())
