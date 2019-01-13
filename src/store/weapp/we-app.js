import _ from 'lodash'
import { autorun, action, createAtom, decorate, observable } from 'mobx'

export default class WeApp {
  $callbacks = []
  $atom = createAtom('we_app_atom')
  $clears = []

  constructor($scope) {
    this.$scope = $scope
  }

  install() {
    const clear = autorun(() => {
      const callbacks = this.$callbacks.splice(0)
      const callback = callbacks.length ? () => callbacks.forEach(cb => cb()) : void 0
      this.$atom.reportObserved()
      this.$scope.setData({ context: this.render() }, callback)
    })
    this.addClear(clear)
  }

  uninstall() {
    this.$clears.forEach(cb => cb())
  }

  update(obj, cb) {
    _.forEach(obj, (value, key) => _.set(this, key, value))
    cb && this.$callbacks.push(cb)
    this.$atom.reportChanged()
  }

  addClear(cb) {
    this.$clears.push(cb)
  }

  wxForEach(list, cb) {
    return _.map(list, (value, key) => {
      const context = {}
      cb(value, key, context)
      return context
    })
  }

  get props() {
    return this.$scope.options || this.$scope.properties
  }
}

decorate(WeApp, {
  store: observable,
  update: action,
})
