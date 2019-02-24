import _ from 'lodash'

const ignoreErrors = ['cancel']

async function loading(target, title = '加载中', retry = _.get(this, 'retry', false)) {
  await wxp.showLoading({ title, mask: true })
  const action = Promise.resolve(target instanceof Function ? target() : target)

  return action
    .finally(wxp.hideLoading)
    .catch(err => {
      const msg = err.message
      if (!ignoreErrors.includes(msg)) {
        wxp.showModal({
          title: '错误',
          content: msg,
          showCancel: retry,
          confirmColor: '#E0B44F',
          confirmText: retry ? '重新加载' : '知道了',
        }).then(res => {
          if (res.confirm && retry) loading(...arguments)
        })
      }
      throw err
    })
}

function loadingDecorator({ title, retry = _.get(this, 'retry') } = {}) {
  return function (target, name, descriptor) {
    const func = descriptor.value
    descriptor.value = function () {
      return loading(() => func.apply(this, arguments), title, retry)
    }
  }
}

export default function autoLoading(...args) {
  if (args[0] instanceof Promise || args[0] instanceof Function) {
    return loading.call(this, ...args)
  } else if (args.length === 3) {
    return loadingDecorator.call(this)(...args)
  } else {
    return loadingDecorator.call(this, args[0])
  }
}

autoLoading.retry = function () {
  return autoLoading.apply({ retry: true }, arguments)
}
