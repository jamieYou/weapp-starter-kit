import { observable } from 'mobx'
import _ from 'lodash'

export function observables(properties, shallowList) {
  return target => {
    const { prototype } = target
    _.forEach(properties, (value, key) => {
      const result = observable(prototype, key, { initializer: () => value })
      Object.defineProperty(prototype, key, result)
    })
    _.forEach(shallowList, (value, key) => {
      const result = observable.ref(prototype, key, { initializer: () => value })
      Object.defineProperty(prototype, key, result)
    })
    Object.defineProperty(prototype, 'initialState', {
      enumerable: false,
      value: Object.assign({}, properties, shallowList),
    })
    return target
  }
}
