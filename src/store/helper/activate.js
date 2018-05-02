import { isObservable, _ } from '@lib'

export default function activate(store) {
  isObservable(store)
  const descriptors = Object.getOwnPropertyDescriptors(store)
  _.forEach(descriptors, (descriptor, name) => {
    if (descriptor.get && !descriptor.enumerable) {
      descriptor.enumerable = true
      Object.defineProperty(store, name, descriptor)
    }
  })
}
