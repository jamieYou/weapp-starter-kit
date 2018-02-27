import { apiOrigin } from './environment'
import urlConcat from './url-concat'

const defaultOptions = {
  method: 'GET',
  header: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

export default function fetch(pathname, options = {}) {
  const mergeUrl = urlConcat(apiOrigin, 'api/v1', pathname)
  const apiName = options.apiName || 'request'
  const opts = Object.assign({}, defaultOptions, options)

  return wx[apiName]({ url: mergeUrl, ...opts })
    .then(res => {
      const { statusCode } = res
      if (statusCode >= 200 && statusCode < 300) {
        return res
      } else {
        const err = new Error(res.data.msg || res.data.error || res.data.error_msg)
        err.status = statusCode
        throw err
      }
    })
}
