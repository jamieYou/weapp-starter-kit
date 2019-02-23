import _ from 'lodash'
import { createMethod, page_options, component_options, getAllPrototypeDescriptors } from './helper'

function createPageWeApp(PageClass, target_require) {
  const descriptors = getAllPrototypeDescriptors(PageClass)
  const func_list = {}
  _.forEach(descriptors, (descriptor, key) => 'value' in descriptor && createMethod(func_list, key))

  PageClass.prototype.render = target_require('./ewx-render.js')

  Page(
    Object.assign({ get$WeAppClass: () => PageClass }, func_list, page_options)
  )
}

function createComponentWeApp(ComponentClass, target_require) {
  const descriptors = getAllPrototypeDescriptors(ComponentClass)
  const obj = { lifetimes: {}, pageLifetimes: {}, methods: {} }
  const lifetimes = [
    'created',
    'attached',
    'ready',
    'moved',
    'detached',
    'error'
  ]
  const pageLifetimes = ['show', 'hide', 'resize']
  _.forEach(descriptors, (descriptor, key) => {
    if ('value' in descriptor) {
      if (lifetimes.includes(key)) {
        createMethod(obj.lifetimes, key)
      } else if (pageLifetimes.includes(key)) {
        createMethod(obj.pageLifetimes, key)
      } else {
        createMethod(obj.methods, key)
      }
    }
  })

  Object.assign(
    obj,
    _.pick(ComponentClass, 'properties', 'externalClasses', 'options')
  )

  ComponentClass.prototype.render = target_require('./ewx-render.js')

  obj.methods.get$WeAppClass = () => ComponentClass

  Component(
    _.merge({}, obj, component_options)
  )
}

export function createPage(target_require) {
  return page => createPageWeApp(page, target_require)
}

export function createComponent(target_require) {
  return component => createComponentWeApp(component, target_require)
}
