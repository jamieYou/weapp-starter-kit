import { WebAPIStore } from 'mobx-multiple-store'
import { fly } from '@/utils'

export class AuthStore extends WebAPIStore {
  async login() {
    try {
      const { code } = await wx.login()
      const { data } = await fly.post('login', { code })
      this.loginResolve(data)
      return data
    } catch (err) {
      this.loginReject(err)
      throw err
    }
  }
}

export const authStore = new AuthStore()
