import { fetch, fetchInteractive } from '@utils'

Page({
  data: {
    topics: []
  },

  @fetchInteractive({ retry: true })
  async onLoad() {
    const res = await fetch('topics', { data: { limit: 5 } })
    this.setData({ topics: res.data.data })
  }
})
