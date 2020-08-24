import _ from 'lodash';

// 通过 class new 出来的对象，在小程序 setData 时会丢失 getter 属性，通过下面的函数可解决
// 此方法已用于 src/stores/helper/observable.js、src/models/record.js
export default function toJSONDeep() {
  if (!this.$json_names) {
    const ownNames = Object.keys(this);
    const getComputedNames = function (store, __proto__ = store.__proto__) {
      if (__proto__ === Object.prototype) {
        return;
      }
      const descriptors = Object.getOwnPropertyDescriptors(__proto__);
      _.forEach(descriptors, (descriptor, name) => {
        if (!ownNames.includes(name) && descriptor.get) {
          ownNames.push(name);
        }
      });
      getComputedNames(store, __proto__.__proto__);
    };

    getComputedNames(this);
    this.$json_names = ownNames;
  }

  const excludeJsonNames = this.constructor.excludeJsonNames || [];
  return _.pick(this, _.without(this.$json_names, ...excludeJsonNames));
}
