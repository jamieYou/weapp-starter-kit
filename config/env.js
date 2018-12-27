const path = require('path')
const fs = require('fs')
const ipv4 = require('ipv4')
const env = require('node-env-file')

const envFile = path.resolve('.env')
if (fs.existsSync(envFile)) env(envFile)

module.exports = {
  port: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  get API_URL() {
    return process.env.API_URL || `http://${ipv4}:${this.port}`
  },
  get __DEV__() {
    return this.NODE_ENV === 'development' || this.NODE_ENV === 'test'
  }
}
