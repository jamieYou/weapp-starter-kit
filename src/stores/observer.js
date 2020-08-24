import { autorun, observable, createAtom, extendObservable } from 'mobx'
import _ from 'lodash'

export default function Observer(options = {}) {
  let {
    $type, state, computed,
    onLoad, onUnload,
    lifetimes = {}, methods = {},
    ...config
  } = options

  function install(e) {
    // 只设置一次新属性, 使用 behaviors 时，install 会被 behaviors 和 Component 触发
    if (!this.isObserver) {
      this.$clears = []
      this.$dataAtom = createAtom('setDataAtom')
      this.$setData = this.setData
      this.setData = (data, cb) => {
        this.$setData(data, cb)
        this.$dataAtom.reportChanged()
      }
      this.$stateKeys = []
      this.$computedKeys = []
      this.$propertyKeys = []
      this.isObserver = true
    }

    if (state) {
      const states = state.call(this, e)
      this.$stateKeys.push(...Object.keys(states))
      extendObservable(this, states)
    }

    // 只有页面和组件才同步 state 到 data
    if (['Page', 'Component'].includes($type) && this.$stateKeys.length) {
      this.$clears.push(
        autorun(() => {
          this.$dataAtom.reportObserved()
          const state = _.pick(this, this.$stateKeys)
          this.$setData(_.mapValues(state, toJSON))
        }, { delay: 1 })
      )
    }

    if (computed) {
      this.$computedKeys.push(...Object.getOwnPropertyNames(computed))
      extendObservable(this, computed)
    }

    // 只有页面和组件才同步 computed 到 data
    if (['Page', 'Component'].includes($type) && this.$computedKeys.length) {
      this.$clears.push(
        autorun(() => {
          this.$dataAtom.reportObserved()
          const computed = _.pick(this, this.$computedKeys)
          this.$setData(_.mapValues(computed, toJSON))
        }, { delay: 1 })
      )
    }

    if (config.properties) {
      this.$propertyKeys.push(...Object.keys(config.properties))
    }

    // 只有页面和组件才让 properties 变成 observable
    if (['Page', 'Component'].includes($type) && this.$propertyKeys.length) {
      const properties = observable({}, null, { deep: false })
      _.forEach(this.properties, (v, key) => {
        if (this.$propertyKeys.includes(key)) {
          properties[key] = v

          Object.defineProperty(this.properties, key, {
            get() {
              return properties[key]
            },
            set(value) {
              properties[key] = value
            }
          })
        }
      })
    }
  }

  function uninstall() {
    this.$clears.forEach(cb => cb())
  }

  function $nextTick(cb) {
    if (cb) {
      this.$setData(null, cb)
    } else {
      return new Promise(resolve => this.$setData(null, resolve))
    }
  }

  if ($type === 'Page') {
    return Page(Object.assign(config, {
      $nextTick,
      onLoad(e) {
        install.call(this, e)
        return onLoad && onLoad.call(this, e)
      },

      onUnload() {
        uninstall.call(this)
        return onUnload && onUnload.call(this)
      }
    }))
  } else {
    const attachedEnd = lifetimes.attached || config.attached
    const detachedEnd = lifetimes.detached || config.detached

    const attached = function () {
      install.call(this)
      return attachedEnd && attachedEnd.call(this)
    }

    const detached = function () {
      uninstall.call(this)
      return detachedEnd && detachedEnd.call(this)
    }

    if ($type === 'Component') {
      Object.assign(methods, { $nextTick })
      Object.assign(lifetimes, { attached, detached })

      return Component(Object.assign(config, { methods, lifetimes }))
    } else {
      return Behavior(Object.assign(config, { methods, attached }))
    }
  }
}

function toJSON(v) {
  if (v && v.toJSON) {
    v = v.toJSON()
  }
  if (_.isObjectLike(v)) {
    if (_.isArray(v)) {
      return _.map(v, toJSON)
    } else {
      return _.mapValues(v, toJSON)
    }
  } else {
    return v
  }
}

Observer.Page = function (options = {}) {
  return Observer({ ...options, $type: 'Page' })
}

Observer.Component = function (options = {}) {
  return Observer({ ...options, $type: 'Component' })
}

Observer.Behavior = function (options = {}) {
  return Observer({ ...options, $type: 'Behavior' })
}
