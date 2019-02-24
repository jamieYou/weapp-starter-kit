import _ from 'lodash'
import { observable, decorate, isObservable, createAtom } from 'mobx'
import WeApp from './we-app'

export function callOriginFunc(obj, key, args) {
  if (obj[key]) return obj[key](...args)
}

export function createMethod(obj, key) {
  _.set(obj, key, function () {
    return this.weApp[key](...arguments)
  })
}

export function getAllPrototypeDescriptors(Target) {
  let descriptors = Object.getOwnPropertyDescriptors(Target.prototype)
  let { prototype } = Target
  while (prototype.__proto__ !== WeApp.prototype) {
    descriptors = Object.assign({}, Object.getOwnPropertyDescriptors(prototype.__proto__), descriptors)
    prototype = prototype.__proto__
  }
  return _.omit(descriptors, 'constructor')
}

function autoObservables(target) {
  const obj = {}
  Object.keys(target).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(target, key)
    if (!/^(\$|_)/.test(key) && typeof descriptor.value !== 'function' && !isObservable(descriptor.value)) {
      obj[key] = observable
    }
  })
  decorate(target, obj)
}

export const page_options = {
  onLoad() {
    const $WeAppClass = this.get$WeAppClass()
    this.weApp = new $WeAppClass(this)
    autoObservables(this.weApp)
    const result = callOriginFunc(this.weApp, 'onLoad', arguments)
    this.weApp.install()
    return result
  },
  onUnload() {
    this.weApp.uninstall()
    return callOriginFunc(this.weApp, 'onUnload', arguments)
  }
}

export const component_options = {
  lifetimes: {
    created() {
      const $WeAppClass = this.get$WeAppClass()
      // decorate(
      //   this.properties,
      //   _.mapValues($WeAppClass.properties, () => observable.ref)
      // )
      _.forEach($WeAppClass.properties, (v, key) => {
        let output = this.properties[key]
        const $atom = createAtom(`${key}_atom`)
        Object.defineProperty(this.properties, key, {
          get() {
            $atom.reportObserved()
            return output
          },
          set(input) {
            if (!_.isEqual(output, input)) {
              $atom.reportChanged()
              output = input
            }
          }
        })
      })
      this.weApp = new $WeAppClass(this)
      autoObservables(this.weApp)
      return callOriginFunc(this.weApp, 'created', arguments)
    },
    attached() {
      this.weApp.install()
      return callOriginFunc(this.weApp, 'attached', arguments)
    },
    detached() {
      this.weApp.uninstall()
      return callOriginFunc(this.weApp, 'detached', arguments)
    }
  }
}
