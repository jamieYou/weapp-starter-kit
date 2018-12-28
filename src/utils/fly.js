import Fly from 'flyio/dist/npm/wx'
import _ from 'lodash'
import { apiOrigin } from './env'

const fly = new Fly()

fly.config.baseURL = apiOrigin + '/api/v1'

fly.interceptors.response.use(
  res => {
    res.isResponse = true
    return res
  },
  err => {
    err.message = _.get(err.response.data, 'error', err.message)
    return err
  })

export default fly
