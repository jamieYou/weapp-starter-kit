import { fetch } from '@utils'

export class AuthStore {
  id: number
  token: string
  nickname: ?string
  gender: ?string
  avatar: ?string
  afterLogin: Promise
  loginResolve: Function
  loginReject: Function
  retryTimes = 5

  constructor() {
    const session = wx.getStorageSync('session')
    Object.assign(this, session)
    this.initLoginState()
  }

  initLoginState() {
    this.afterLogin = new Promise((resolve, reject) => {
      this.loginResolve = resolve
      this.loginReject = reject
    })
  }

  async login(): Promise {
    try {
      const { code } = await wx.login()
      const { data } = await fetch('login', { method: 'POST', data: { code } })
      wx.setStorageSync('session', data)
      this.loginResolve(data)
      return data
    } catch (err) {
      wx.removeStorageSync('session')
      this.loginReject(err)
      throw err
    }
  }
}

export const authStore: AuthStore = new AuthStore()
