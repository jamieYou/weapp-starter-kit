// http://es6.ruanyifeng.com/#docs/promise#finally
Promise.prototype.finally = function (callback) {
  return this.then(
    res => {
      callback()
      return res
    },
    err => {
      callback()
      throw err
    }
  )
}

// wx.api 转 promise
const wxApis = ['request']

wxApis.forEach(name => {
  const func = wx[name]
  if (typeof func !== 'function') {
    throw new Error(`wx.${name} is not a function`)
  }
  Object.defineProperty(wx, name, {
    value(options = {}): Promise {
      return new Promise((resolve, reject) => {
        const { success, fail, complete } = options
        func({
          ...options,
          success: res => {
            resolve(res)
            success && success(res)
          },
          fail: err => {
            reject(err)
            fail && fail(err)
          },
          complete
        })
      })
    }
  })
})
