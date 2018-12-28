import { WebAPIStore } from 'mobx-multiple-store'
import { fetch } from '@utils'

export class AuthStore extends WebAPIStore {
  afterLogin = this.initLoginState()

  initLoginState() {
    this.afterLogin = new Promise((resolve, reject) => {
      this.loginResolve = resolve
      this.loginReject = reject
    })
  }

  async login() {
    try {
      const { code } = await wx.login()
      const { data } = await fetch('login', { method: 'POST', data: { code } })
      this.loginResolve(data)
      return data
    } catch (err) {
      this.loginReject(err)
      throw err
    }
  }
}

export const authStore = new AuthStore()
