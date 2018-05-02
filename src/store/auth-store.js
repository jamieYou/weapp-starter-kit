import { fetch } from '@utils'

export class AuthStore {
  id: number
  token: string
  nickname: ?string
  gender: ?string
  avatar: ?string
  loginResolve: Function
  loginReject: Function

  afterLogin = this.initLoginState()

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
      this.loginResolve(data)
      return data
    } catch (err) {
      this.loginReject(err)
      throw err
    }
  }
}

export const authStore: AuthStore = new AuthStore()
