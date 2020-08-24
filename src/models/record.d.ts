import { Model } from '@vuex-orm/core/lib'
import { AxiosInstance } from 'axios'

export default class Record extends Model {
  static api(): AxiosInstance
  api(): AxiosInstance
  updateAttrs(attrs: Object)
}
