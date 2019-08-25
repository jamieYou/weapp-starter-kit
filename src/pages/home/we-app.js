import _ from 'lodash'
import { autorun, action, configure, decorate, toJS, isObservable } from 'mobx'

configure({ enforceActions: 'never' })

export default class WeApp {
  $callbacks = []
  $clears = []
  $ewx_handle_count = 0
  $setData = this.setData
  setData = this._setData

  $install() {
    const clear = autorun(() => this.$runRender(), { delay: 1 })
    this.$addClear(clear)
  }

  $uninstall() {
    this.$clears.forEach(cb => cb())
  }

  $runRender() {
    const callbacks = this.$callbacks.splice(0)
    const callback = callbacks.length ? () => callbacks.forEach(cb => cb()) : void 0
    this.$resetHandleName()
    const obj = _.mapValues(this.$mobx.values, (v, k) => {
      const value = this[k]
      return isObservable(value) ? toJS(value) : value
    })
    obj.$ctx = this.render()
    this.$setData(this.$getUpdateData(obj, this.data), callback)
  }

  _setData(data, cb) {
    _.forEach(data, (value, key) => _.set(this, key, value))
    cb && this.$callbacks.push(cb)
  }

  $addClear(cb) {
    this.$clears.push(cb)
  }

  ewxForEach(list, cb) {
    return _.map(list, (value, key) => {
      const context = {}
      cb(value, key, context)
      return context
    })
  }

  ewxParseText(text) {
    return text === null ? '' : text
  }

  ewxParseEvent(handle) {
    if (typeof handle === 'function') {
      const path = this.$getHandleName()
      _.set(this, path, handle.bind(this))
      return path
    }
    return handle
  }

  $getUpdateData(newData, oldData) {
    if (oldData.$ctx) {
      const obj = {}
      _.forEach(newData, (value, key) => {
        if (value !== oldData[key]) obj[key] = value
      })
      return obj
    } else {
      return newData
    }
  }

  $getHandleName() {
    this.$ewx_handle_count++
    return '$handle_' + this.$ewx_handle_count.toString(16)
  }

  $resetHandleName() {
    this.$ewx_handle_count = 0
  }
}

WeApp.prototype.$get = _.get
WeApp.prototype.$set = _.set

decorate(WeApp, {
  update: action
})
