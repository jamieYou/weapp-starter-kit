import { action, observable, configure } from 'mobx'

configure({ enforceActions: process.env.NODE_ENV !== 'production' })

export class StoreHelper {
  static _instanceList: Map

  static get instanceList(): Map {
    if (!this._instanceList) {
      this._instanceList = observable.map({}, { deep: false })
    }
    return this._instanceList
  }

  static create(instanceKey, newState) {
    const store = new this(instanceKey)
    newState && store.setState(newState)
    return store
  }

  static findOrCreate(instanceKey, newState) {
    instanceKey = this.checkKey(instanceKey)
    if (!this.instanceList.has(instanceKey)) {
      this.instanceList.set(instanceKey, this.create(instanceKey, newState))
    }
    return this.instanceList.get(instanceKey)
  }

  static createOrUpdate(instanceKey, newState) {
    instanceKey = this.checkKey(instanceKey)
    if (!this.instanceList.has(instanceKey)) {
      this.instanceList.set(instanceKey, this.create(instanceKey, newState))
    } else {
      newState && this.instanceList.get(instanceKey).setState(newState)
    }
    return this.instanceList.get(instanceKey)
  }

  static checkKey(instanceKey) {
    if (!instanceKey) {
      throw new Error('instanceKey is not defined')
    }
    return String(instanceKey)
  }

  instanceKey: string

  constructor(instanceKey = 'only') {
    this.instanceKey = instanceKey
  }

  @action
  setState(newState) {
    Object.assign(this, newState)
  }
}
