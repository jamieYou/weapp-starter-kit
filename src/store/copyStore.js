import {
  isObservable,
  isObservableArray,
  isObservableObject,
  isObservableMap,
  isBoxedObservable
} from '@lib'

function copyObject(res = {}, object) {
  function copy(propertyName) {
    if (!/mobx/.test(propertyName) && !(propertyName in res) && typeof object[propertyName] !== 'function') {
      res[propertyName] = copyStore(object[propertyName])
    }
  }

  Object.getOwnPropertyNames(object).forEach(copy)
  Object.getOwnPropertyNames(object.__proto__).forEach(copy)
}

export default function copyStore(source, detectCycles = true, __alreadySeen = []) {
  function cache(value) {
    if (detectCycles) {
      __alreadySeen.push([source, value])
    }
    return value
  }

  if (isObservable(source)) {
    if (detectCycles && __alreadySeen === null) {
      __alreadySeen = []
    }
    if (detectCycles && source !== null && typeof source === "object") {
      const __alreadySeenItem = __alreadySeen.find(v => v[0] === source)
      if (__alreadySeenItem) {
        return __alreadySeenItem[1]
      }
    }
    if (isObservableArray(source)) {
      const res = cache([])
      const toAdd = source.map(value => copyStore(value, detectCycles, __alreadySeen))
      res.push(...toAdd)
      return res
    }
    if (isObservableObject(source)) {
      const res = cache({})
      copyObject(res, source)
      return res
    }
    if (isObservableMap(source)) {
      const res = cache({})
      source.forEach((value, key) => res[key] = copyStore(value, detectCycles, __alreadySeen))
      return res
    }
    if (isBoxedObservable(source)) {
      return copyStore(source.get(), detectCycles, __alreadySeen)
    }
  }

  // Todo 优化一下效率，风险有待研究。
  // if (source instanceof Array) {
  //   return source.map(value => copyStore(value))
  // }
  //
  // if (source !== null && typeof source === 'object') {
  //   const res = {}
  //   for (let key in source) {
  //     res[key] = copyStore(source[key])
  //   }
  //   return res
  // }
  return source
}
