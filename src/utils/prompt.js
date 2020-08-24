export function showToast(params) {
  const options = {
    title: '',
    icon: 'none',
    mask: true,
    duration: 1500,
  };
  if (typeof params === 'string') {
    Object.assign(options, { title: params });
  } else {
    Object.assign(options, params);
  }
  wxp.showToast(options);
  return new Promise(resolve => setTimeout(resolve, options.duration));
}

export function showLoading(params) {
  const options = {
    title: '',
    mask: true,
  };
  if (typeof params === 'string') {
    Object.assign(options, { title: params });
  } else {
    Object.assign(options, params);
  }
  return wxp.showLoading(options);
}

export const alert = (content, opts = {}) => {
  return wxp.showModal({
    content,
    confirmText: '我知道了',
    showCancel: false,
    ...opts
  });
};

export const confirm = async (content, opts = {}) => {
  const { confirm } = await wxp.showModal({
    content,
    confirmText: '确认',
    showCancel: true,
    cancelText: '取消',
    ...opts
  });
  if (!confirm) {
    return Promise.reject(new Error('用户取消'));
  }
};

export function autoLoadingDecorator(target, name, descriptor) {
  const func = descriptor.value;
  descriptor.value = function () {
    return autoLoading(func.apply(this, arguments));
  };
}

export function autoLoading(target, options) {
  showLoading(options || '加载中');
  const action = Promise.resolve(target instanceof Function ? target() : target);
  return action
    .finally(() => {
      wxp.hideLoading();
    })
    .catch(err => {
      errHandle(err);
    });
}

export function pageRefresh(target, name, descriptor) {
  const func = descriptor.value;
  descriptor.value = async function () {
    try {
      await func.apply(this, arguments);
    } catch (err) {
      errHandle(err);
    } finally {
      wxp.stopPullDownRefresh();
    }
  };
}

export function errToast(target, name, descriptor) {
  const func = descriptor.value;
  descriptor.value = function () {
    return func.apply(this, arguments).catch(err => {
      wxp.hideLoading();
      errHandle(err);
    });
  };
}

export function errHandle(err) {
  const ignoreErrors = /(cancel|ignore|请先登录)/i;
  const msg = err.message || err.errMsg;
  if (!ignoreErrors.test(msg)) {
    msg && alert(msg, {
      title: '请求失败',
    });
  }
  throw err;
}
