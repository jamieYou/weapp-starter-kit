import { fetch } from '@utils'

Page({
  data: {
    topics: []
  },

  @Page.fetchAction
  async onLoad() {
    const res = await fetch('topics', { data: { limit: 5 } })
    return { topics: res.data.data }
  }
})
