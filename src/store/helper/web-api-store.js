import { observable, toJS, computed, _ } from '@lib'
import { StoreHelper } from './store-helper'

export class WebAPIStore extends StoreHelper {
  fetchData: Function
  @observable isFetching = false
  @observable isRejected = false
  @observable isFulfilled = false
  @observable error: ?Error = null

  setPendingState(actionName) {
    this.isFetching = true
    this.logMessage("%cpending  ", "color:blue", actionName)
  }

  setFulfilledState(res, actionName) {
    const newState = _.has(res, 'statusCode') ? res.data : res
    Object.assign(this, {
      isFetching: false,
      isRejected: false,
      isFulfilled: true,
      error: null,
    }, newState)
    this.logMessage("%cfulfilled", "color:green", actionName)
  }

  setRejectedState(error, actionName, options) {
    const nextState = {
      error,
      isFetching: false,
      isRejected: true,
    }
    Object.assign(this, nextState, options)
    this.logMessage("%crejected", "color:red", actionName)
  }

  tryFetchData() {
    return this.instanceKey && !this.isFulfilled && this.fetchData()
  }

  logMessage(status, color, actionName) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        status, color,
        `${this.constructor.name.replace(/^\w/, w => w.toLowerCase())}->${actionName}`,
        { state: toJS(this) }
      )
    }
  }

  loadingAll(...webAPIStores: WebAPIStore[]) {
    return this.loading || !!webAPIStores.find(item => item.loading)
  }

  @computed
  get loading() {
    return this.isFetching
  }
}
