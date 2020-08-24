const _ = require('lodash')
const { appENV } = require('./config/env')

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        'useBuiltIns': 'usage',
        'corejs': 3,
        'targets': {
          'chrome': '49',
          'safari': '10'
        }
      }
    ]
  ],
  plugins: [
    'lodash',
    [
      'transform-define',
      _.mapKeys(appENV, (v, key) => `process.env.${key}`)
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        'corejs': false,
        'helpers': true,
        'regenerator': false,
        'useESModules': false
      }
    ],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-export-default-from',
    ['@babel/plugin-proposal-pipeline-operator', { 'proposal': 'minimal' }],
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-function-bind',
  ]
}
