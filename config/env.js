const path = require('path')
const fs = require('fs')
const env = require('node-env-file')
const _ = require('lodash')

const APP_ENV = process.env.APP_ENV || 'development'
const localEnv = path.resolve('.env.local')

env(path.resolve(`.env.${APP_ENV}`))
if (fs.existsSync(localEnv)) env(localEnv)

module.exports = {
  appENV: _.pickBy(process.env, (v, key) => {
    return /^APP_/.test(key) || key === 'NODE_ENV'
  })
}
