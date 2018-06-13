import { flow, autoBind, _ } from '@lib'
import type { WebAPIStore } from './web-api-store'

function fetchActionDecorator(target, name, descriptor, { bound = false, autoMerge = false, useFlow = false } = {}) {
  const { value } = descriptor
  if (typeof value !== 'function') throw new Error(`${name} is not a function`)
  const oldAction = useFlow ? flow(value) : value

  descriptor.value = flow(function* result() {
    const self: WebAPIStore = this
    try {
      self.setPendingState(name)
      const res = yield oldAction.apply(self, arguments)
      const newState = do {
        if (autoMerge) _.has(res, 'statusCode') ? res.data : res
      }
      self.setFulfilledState(newState, name)
      return res
    } catch (err) {
      self.setRejectedState(err, name)
      throw err
    }
  })

  return bound ? autoBind(target, name, descriptor) : descriptor
}

function fetchActionDecoratorCreate(options: Object) {
  return (...args) => fetchActionDecorator(...args, options)
}

export default function fetchAction(...args) {
  if (args.length === 3) {
    return fetchActionDecorator(...args)
  } else {
    return fetchActionDecoratorCreate(args[0])
  }
}

fetchAction.bound = fetchActionDecoratorCreate({ bound: true })
fetchAction.flow = fetchActionDecoratorCreate({ bound: true, useFlow: true })
fetchAction.merge = fetchActionDecoratorCreate({ autoMerge: true })
