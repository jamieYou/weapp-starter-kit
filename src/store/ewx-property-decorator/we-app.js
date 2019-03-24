import _ from 'lodash'
import { autorun, action, configure, createAtom } from 'mobx'

configure({ enforceActions: 'never' })

export default class WeApp {
  $callbacks = []
  $clears = []
  $ewx_handle_count = 0
  $dataAtom = createAtom('setDataAtom')
  $setData = this.setData
  setData = this._setData

  install() {
    const clear = autorun(() => this.runRender(), { delay: 1 })
    this.addClear(clear)
  }

  uninstall() {
    this.$clears.forEach(cb => cb())
  }

  runRender() {
    const callbacks = this.$callbacks.splice(0)
    const callback = callbacks.length ? () => callbacks.forEach(cb => cb()) : void 0
    this.resetHandleName()
    this.$dataAtom.reportObserved()
    const $ctx = this.render()
    this.$setData(this.getUpdateContext($ctx, this.data.$ctx), callback)
  }

  @action
  update(obj, cb) {
    _.forEach(obj, (value, key) => _.set(this, key, value))
    cb && this.$callbacks.push(cb)
  }

  _setData(data, cb) {
    _.forEach(data, (value, key) => _.set(this.data, key, value))
    cb && this.$callbacks.push(cb)
    this.$dataAtom.reportChanged()
  }

  addClear(cb) {
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
    return _.isNull(text) ? '' : text
  }

  ewxParseEvent(handle) {
    if (typeof handle === 'function') {
      const path = this.getHandleName()
      _.set(this, path, handle.bind(this))
      return path
    }
    return handle
  }

  getUpdateContext(newContext, oldContext) {
    if (oldContext) {
      const obj = {}
      _.forEach(newContext, (value, key) => {
        if (value !== oldContext[key]) obj[`$ctx.${key}`] = value
      })
      return obj
    } else {
      return { $ctx: newContext }
    }
  }

  getHandleName() {
    this.$ewx_handle_count++
    return '$handle_' + this.$ewx_handle_count.toString(16)
  }

  resetHandleName() {
    this.$ewx_handle_count = 0
  }

  get(object, path, defaultValue) {
    return _.get(object, path, defaultValue)
  }
}
