const path = require('path')

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve('src'),
      'mobx$': 'mobx/lib/mobx',
    },
    aliasFields: ['browser', 'main'],
    unsafeCache: true,
  },
}
