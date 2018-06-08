import { fetch } from '@utils'

Page({
  data: {
    topics: []
  },

  async onLoad() {
    const res = await fetch('topics', { data: { limit: 5 } })
    this.setData({ topics: res.data.data })
  }
})
