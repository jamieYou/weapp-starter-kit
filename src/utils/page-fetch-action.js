Page.fetchAction = function fetchAction(target, name, descriptor) {
  const oldAction = descriptor.value
  descriptor.value = async function () {
    this.setData({ isFetching: true })
    try {
      const res = await oldAction.apply(this, arguments)
      this.setData(
        Object.assign({
          isFetching: false,
          isRejected: false,
          isFulfilled: true,
          error: null
        }, res)
      )
      this.setData(this.data)
    } catch (err) {
      this.setData({
        isFetching: false,
        isRejected: true,
        error: err
      })
    }
  }
  return descriptor
}
