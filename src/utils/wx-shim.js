// http://es6.ruanyifeng.com/#docs/promise#Promise-prototype-finally
Promise.prototype.finally = function (cb) {
  return this.then(
    value => Promise.resolve(cb()).then(() => value),
    reason => Promise.resolve(cb()).then(() => {
      throw reason
    })
  )
}

// wx.api 转 promise
const wxApis = [
  'request',
  'showToast',
  'login',
  'checkSession',
  'chooseImage',
  'canvasToTempFilePath',
  'previewImage',
  'getImageInfo',
  'showLoading',
  'getSystemInfo',
  'uploadFile',
  'downloadFile',
  'requestPayment',
  'hideShareMenu',
  'getUserInfo',
  'showModal',
]

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
