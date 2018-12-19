import _ from 'lodash'
import { createMethod, page_options, component_options } from './helper'

function createPageWeApp(PageClass, target_require) {
  PageClass.prototype.render = target_require('./weapp-render.js')
  const descriptors = Object.getOwnPropertyDescriptors(PageClass.prototype)
  const func_list = _.reduce(
    descriptors,
    (obj, descriptor, key) => {
      if ('value' in descriptor && key !== 'constructor') {
        createMethod(obj, key)
      }
      return obj
    },
    {}
  )

  Page(
    Object.assign({ WeAppClass: PageClass }, func_list, page_options)
  )
}

function createComponentWeApp(ComponentClass, target_require) {
  ComponentClass.prototype.render = target_require('./weapp-render.js')
  const descriptors = Object.getOwnPropertyDescriptors(ComponentClass.prototype)
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
  _.forEach(
    descriptors,
    (descriptor, key) => {
      if ('value' in descriptor && key !== 'constructor') {
        if (lifetimes.includes(key)) {
          createMethod(obj.lifetimes, key)
        } else if (pageLifetimes.includes(key)) {
          createMethod(obj.pageLifetimes, key)
        } else {
          createMethod(obj.methods, key)
        }
      }
    },
    {}
  )

  Object.assign(
    obj,
    _.pick(ComponentClass, 'properties', 'externalClasses', 'options')
  )

  Component(
    _.merge({ data: { WeAppClass: ComponentClass } }, obj, component_options)
  )
}

export function createPage(target_require) {
  return page => createPageWeApp(page, target_require)
}

export function createComponent(target_require) {
  return component => createComponentWeApp(component, target_require)
}
