import _ from 'lodash';

export default class Observable {
  static create(state) {
    const instance = new this();
    if (state) {
      _.forEach(Object.getOwnPropertyDescriptors(state), (descriptor, key) => {
        if ('value' in descriptor) {
          instance[key] = descriptor.value;
        } else {
          Object.defineProperty(instance, key, descriptor);
        }
      });
    }
    return instance;
  }
}

Observable.prototype.toJSON = require('@/utils/to-json-deep').default;
