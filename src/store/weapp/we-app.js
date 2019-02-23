import _ from 'lodash'
import { autorun, action, configure } from 'mobx'

configure({ enforceActions: 'never' })

export default class WeApp {
  $callbacks = []
  $clears = []

  constructor($scope) {
    this.$scope = $scope
  }

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
    this.$scope.setData({ context: this.render() }, callback)
  }

  @action
  update(obj, cb) {
    _.forEach(obj, (value, key) => _.set(this, key, value))
    cb && this.$callbacks.push(cb)
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

  wxParseText(text) {
    return _.isNull(text) ? '' : text
  }

  get props() {
    return this.$scope.options || this.$scope.properties
  }
}
