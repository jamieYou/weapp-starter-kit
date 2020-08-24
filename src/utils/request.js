import _ from 'lodash';
import qs from 'qs';
import axios from 'axios';
import settle from 'axios/lib/core/settle';
import createError from 'axios/lib/core/createError';
import buildFullPath from 'axios/lib/core/buildFullPath';
import buildURL from 'axios/lib/helpers/buildURL';
import decoder from './decoder';

const request = axios.create({
  baseURL: process.env.APP_API_HOST + '/app/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer(params) {
    return qs.stringify(params, { arrayFormat: 'brackets' });
  },
  transformRequest: [(data, headers) => {
    if (!headers['Authorization']) {
      const { authStore } = require('@/stores/auth-store');
      headers['Authorization'] = authStore.access_token;
    }
    return data;
  }],
  adapter(config) {
    const fullPath = buildFullPath(config.baseURL, config.url);
    return wxp.request({
      method: config.method.toUpperCase(),
      url: buildURL(fullPath, config.params, config.paramsSerializer),
      header: config.headers,
      data: config.data,
      dataType: config.dataType || undefined,
      responseType: config.responseType || 'text',
      enableCache: true,
    })
      .then(
        res => {
          return new Promise((resolve, reject) => {
            settle(resolve, reject, {
              data: res.data,
              status: res.statusCode,
              statusText: res.errMsg,
              headers: res.header,
              config: config,
            });
          });
        },
        res => {
          return Promise.reject(createError(
            res.errMsg,
            config,
            0,
          ));
        }
      );
  }
});

request.interceptors.response.use(
  res => {
    res.isResponse = true;
    res.meta = {};
    _.forEach(res.headers, (v, k) => {
      if (/^x-/i.test(k)) {
        const key = _.snakeCase(k.replace(/^x-/i, ''));
        res.meta[key] = decoder(v);
      }
    });
    return res;
  },
  err => {
    const response = _.get(err, 'response', {});
    const { error_message, messages, error, code } = response.data;
    err.message = error_message || messages || error || err.message;
    err.code = code;
    err.status = response.status;
    if (response.status === 401) {
      return login_once().then(() => request.request(response.config));
    }
    return Promise.reject(err);
  }
);

let login_once = _.once(login);

async function login() {
  const { authStore } = require('@/stores/auth-store');
  try {
    await authStore.login();
  } finally {
    login_once = _.once(login);
  }
}

export { request };
