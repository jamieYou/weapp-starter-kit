import { extendObservable } from 'mobx'
import WeApp from './we-app'

function ObserverPage(options) {
  const { data, computed, onLoad, ...option } = options

  return Page({
    ...option,
    onLoad() {
      const proto = this.__proto__.__proto__
      this.__proto__.__proto__ = Object.create(WeApp.prototype, Object.getOwnPropertyDescriptors(proto))
      WeApp.call(this)

      extendObservable(this, data)
      extendObservable(this, computed)

      this.$install()

      return onLoad && onLoad.apply(this, arguments)
    }
  })
}

function ObserverComponent(options) {
  const { data, computed, ...option } = options

  return Component({
    ...option,
    created() {
      extendObservable(this, data)
      extendObservable(this, computed)
      console.warn(this)
    }
  })
}

ObserverPage({
  data: {
    list: [1, 2, 3]
  },
  computed: {
    get size() {
      return this.list.length
    }
  },
  render: require('./ewx-render.js'),
  jia1(v) {
    return v + 1
  },
  click(v) {
    console.warn(v)
  }
})
