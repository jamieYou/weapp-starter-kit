import _ from 'lodash'
import { observable, decorate, isObservable } from 'mobx'
import { getAllPrototypeDescriptors } from './helper'

const pageLifetimes = ['show', 'hide', 'resize']
const lifetimes = [
  'created',
  'attached',
  'ready',
  'moved',
  'detached',
  'error'
]

function extendsComponentClass(ComponentClass) {
  const proto = this.__proto__.__proto__
  this.__proto__.__proto__ = Object.create(ComponentClass.prototype, Object.getOwnPropertyDescriptors(proto))
  // WeApp.prototype.__proto__ = this.__proto__.__proto__
  // this.__proto__.__proto__ = ComponentClass.prototype
  ComponentClass.call(this)
  const observables = {}
  Object.keys(this).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(this, key)
    if (
      !/^(\$|_)/.test(key) &&
      typeof descriptor.value !== 'function' &&
      !isObservable(descriptor.value) &&
      key !== 'data'
    ) {
      observables[key] = observable
    }
  })
  decorate(this, observables)
}

function componentFactory(ComponentClass, target_require) {
  ComponentClass.prototype.render = target_require('./ewx-render.js')
  const descriptors = getAllPrototypeDescriptors(ComponentClass)
  const options = { lifetimes: {}, pageLifetimes: {}, methods: {} }

  _.forEach(descriptors, (descriptor, key) => {
    if (pageLifetimes.includes(key)) {
      options.pageLifetimes[key] = descriptor.value
    } else if (lifetimes.includes(key)) {
      options.lifetimes[key] = descriptor.value
    } else if ('value' in descriptor) {
      options.methods[key] = descriptor.value
    }
  })

  const { created, attached, detached } = options.lifetimes

  options.lifetimes.created = function () {
    extendsComponentClass.call(this, ComponentClass)
    created && created.apply(this, arguments)
  }

  options.lifetimes.attached = function () {
    this.install()
    attached && attached.apply(this, arguments)
  }

  options.lifetimes.detached = function () {
    this.uninstall()
    detached && detached.apply(this, arguments)
  }

  Component(
    Object.assign(
      options,
      _.pick(ComponentClass, 'properties', 'observers', 'externalClasses', 'options', 'data', 'relations'),
    )
  )
}

export default function createComponent(target_require) {
  return component => componentFactory(component, target_require)
}
