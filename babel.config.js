const _ = require('lodash')
const define = _.pick(require('./config/env'), '__DEV__', 'NODE_ENV', 'API_URL')

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        'targets': {
          'browsers': [
            'last 2 versions',
            'safari >= 8'
          ]
        },
        'useBuiltIns': 'entry'
      }
    ]
  ],
  plugins: [
    'lodash',
    [
      '@babel/plugin-transform-runtime',
      {
        'corejs': false,
        'helpers': true,
        'regenerator': false,
        'useESModules': false
      }
    ],
    [
      'transform-define',
      _.mapKeys(define, (v, key) => `process.env.${key}`)
    ],
    [
      'module-resolver',
      {
        'alias': {
          '@store$': './src/store/index.js',
          '@store': './src/store',
          '@utils$': './src/utils/index.js',
          '@utils': './src/utils'
        }
      }
    ],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-optional-chaining',
    ['@babel/plugin-proposal-pipeline-operator', { 'proposal': 'minimal' }],
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-function-bind',
  ]
}
