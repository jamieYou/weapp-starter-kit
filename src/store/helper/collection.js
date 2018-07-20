import { computed, action, observable, IObservableArray } from 'mobx'
import { WebAPIStore } from './web-api-store'
import fetchAction from './fetch-action'

export class Collection extends WebAPIStore {
  fetchApi: Object => Promise
  params: Object = {}

  @observable
  meta = {
    total: 0,
    page: 1,
    per_page: 10,
  }

  @observable data: IObservableArray = []

  @fetchAction.merge
  fetchData() {
    return this.fetchApi({ page: 1, per_page: this.meta.per_page, ...this.params })
  }

  @fetchAction.flow
  async* fetchMoreData() {
    const res = yield this.fetchApi({
      page: this.meta.page + 1,
      per_page: this.meta.per_page,
      ...this.params,
    })
    const { meta, data } = res.data
    this.meta = meta
    this.data.push(...data)
  }

  findItem(id: number) {
    return this.data.find(item => item.id === id)
  }

  @action
  resetData() {
    this.isFulfilled = false
    this.data.clear()
  }

  @computed
  get complete() {
    return this.isFulfilled && this.data.length >= this.meta.total
  }
}
