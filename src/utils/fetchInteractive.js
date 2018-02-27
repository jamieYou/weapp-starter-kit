async function interactive(promise: Promise, title = '加载中', successMessage, failMessage, retry: boolean = false): Promise {
  try {
    await wx.showLoading({ title, mask: true })
    const res = await promise
    wx.hideLoading()
    if (successMessage) wx.showToast({ title: successMessage })
    return res
  } catch (err) {
    wx.hideLoading()
    const errMsg = failMessage || err.message
    if (retry) {
      const { confirm } = await wx.showModal({
        title: errMsg,
        content: '重新加载?'
      })
      if (confirm) return interactive(...arguments)
    } else {
      wx.showToast({ title: errMsg, image: '/images/toast-error.svg' })
      throw err
    }
  }
}

function interactiveDecorator({ title, success, fail, retry } = {}) {
  return function (target, name, descriptor) {
    const func = descriptor.value
    descriptor.value = function () {
      return interactive(func.apply(this, arguments), title, success, fail, retry)
    }
    descriptor.enumerable = true
    return descriptor
  }
}

export default function fetchInteractive(...args) {
  if (args[0] instanceof Promise) {
    return interactive(...args)
  } else if (args.length === 3) {
    return interactiveDecorator()(...args)
  } else {
    return interactiveDecorator(args[0])
  }
}
