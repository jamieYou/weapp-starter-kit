import { autorun, isObservable, _ } from '@lib'
import copyStore from './copyStore'

export default function Observer(options = {}, ...args) {
  const { onLoad, onHide, onShow, onUnload, initProps } = options

  const observerOptions = {
    _autoRunList: [],

    _setProps(options) {
      if (typeof initProps === 'function') {
        this.props = initProps.call(this, options)
      }
    },

    _update(key, value) {
      const result = copyStore(value || {})
      this.setData({ [key]: result })
    },

    _setAutoRun() {
      Object.keys(this.props).forEach(propName => {
        const prop = this.props[propName]
        if (isObservable(prop)) {
          this._autoRunList.push(autorun(() => this._update(propName, prop)))
        }
        else if (Object.prototype.toString.call(prop) === "[object Object]") {
          Object.keys(prop).forEach(key => {
            this._autoRunList.push(autorun(() => this._update(`${propName}.${key}`, prop[key])))
          })
        }
      })
    },

    addAutoRun(propName) {
      this._autoRunList.push(autorun(() => this._update(propName)))
    },

    _clearAutoRun() {
      this._autoRunList.forEach(func => func())
      this._autoRunList = []
    },

    onLoad(options) {
      this._setProps(options)
      this._setAutoRun()
      onLoad && onLoad.apply(this, arguments)
    },

    onShow() {
      this._autoRunList.length === 0 && this._setAutoRun()
      onShow && onShow.apply(this, arguments)
    },

    onUnload() {
      this._clearAutoRun()
      onUnload && onUnload.apply(this, arguments)
    },

    onHide() {
      this._clearAutoRun()
      onHide && onHide.apply(this, arguments)
    },
  }

  return Page(_.merge(options, ...args, observerOptions))
}
