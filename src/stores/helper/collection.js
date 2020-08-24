import { observable } from 'mobx'
import { SimpleStore } from './simple-store';

export class Collection extends SimpleStore {
  static defaultParams = {
    page: 1,
    per_page: 10,
  }

  static excludeJsonNames = ['$params']

  @observable meta = { total: 0, page: 1, offset: 0 }
  @observable data = []
  $params = Object.assign({}, this.constructor.defaultParams, this.params)

  fetchData() {
    this.params.offset = 0;
    return this.fetching(async () => {
      const { data, meta } = await this.fetch(this.params);
      this.meta = meta;
      this.data = data;
    });
  }

  fetchMoreData() {
    if (this.isFetching || this.isComplete) {
      return ;
    }
    this.params.offset = this.data.length;
    return this.fetching(async () => {
      const { data, meta } = await this.fetch(this.params);
      this.meta = meta;
      this.data.push(...data);
    });
  }

  resetData() {
    this.isFulfilled = false;
    this.data = [];
  }

  unshift(item) {
    this.data.unshift(item);
    this.meta.total += 1;
  }

  findItemById(id) {
    return this.data.find(item => +item.id === +id);
  }

  removeItemById(id) {
    const index = this.data.findIndex(item => Number(item.id) === Number(id));
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }

  replaceItem(newItem) {
    const index = this.data.findIndex(item => +item.id === +newItem.id);
    if (index > -1) {
      this.data.splice(index, 1, newItem);
    }
  }

  get params() {
    return this.$params;
  }

  set params(properties) {
    this.$params = Object.assign({}, this.constructor.defaultParams, properties);
  }

  get isComplete() {
    return this.isFulfilled && this.data.length >= this.meta.total;
  }

  get isEmpty() {
    return this.isFulfilled && this.data.length === 0;
  }

  get loadMoreStatus() {
    if (this.isEmpty) { return 'empty'; }
    if (this.isComplete) { return 'noMore'; }
    if (this.isFetching) { return 'loading'; }
    return 'more';
  }
}
