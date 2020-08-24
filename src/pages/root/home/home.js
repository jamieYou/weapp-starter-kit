import { Observer, authStore, Collection } from '@/stores'

Observer.Page({
  state() {
    return {
      authStore, list: new Collection
    }
  },
  computed: {
    get nickname() {
      return authStore.user.nickname
    }
  }
})
