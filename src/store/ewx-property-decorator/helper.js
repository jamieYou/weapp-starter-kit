import _ from 'lodash'
import { createAtom } from 'mobx'
import WeApp from './we-app'

export function getAllPrototypeDescriptors(Target) {
  let descriptors = Object.getOwnPropertyDescriptors(Target.prototype)
  let { prototype } = Target
  while (prototype.__proto__ !== WeApp.prototype) {
    descriptors = Object.assign({}, Object.getOwnPropertyDescriptors(prototype.__proto__), descriptors)
    prototype = prototype.__proto__
  }
  return _.omit(descriptors, 'constructor')
}

function getAtom(target, key) {
  const path = `$property_atoms.${key}`
  if (!_.has(target, path)) _.set(target, path, createAtom(path))
  return target['$property_atoms'][key]
}

export function prop(options = null) {
  if (!_.isPlainObject(options)) options = { type: options }

  return (target, key) => {
    options.observer = function (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) getAtom(this, key).reportChanged()
    }
    _.set(target.constructor, `properties.${key}`, options)

    return {
      configurable: true,
      enumerable: true,
      get() {
        getAtom(this, key).reportObserved()
        return this.properties[key]
      }
    }
  }
}

function setDefault(target, key, value) {
  return key in target ? target[key] : target[key] = value
}

export function watch(property_names) {
  return (target, key, descriptor) => {
    const observers = setDefault(target.constructor, 'observers', {})
    observers[property_names || key] = descriptor.value
  }
}

export function createRelation(component_path, type, target) {
  function getDecorator(name) {
    return ({ constructor }, k, descriptor) => {
      const relations = setDefault(constructor, 'relations', {})
      const obj = setDefault(relations, component_path, {})
      Object.assign(obj, { type, target, [name]: descriptor.value })
    }
  }

  return {
    linked: getDecorator('linked'),
    linkChanged: getDecorator('linkChanged'),
    unlinked: getDecorator('unlinked'),
  }
}

