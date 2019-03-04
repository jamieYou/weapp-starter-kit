import { WeApp, createPage } from '@/store'

@createPage(require)
export class Demo extends WeApp {
  motto = 'Hello World'
  userInfo = {
    nickName: '',
    avatarUrl: '',
  }

  async onLoad() {
    const res = await wxp.getSetting()
    if (res.authSetting['scope.userInfo']) {
      const res = await wxp.getUserInfo()
      this.userInfo = res.userInfo
    }
  }

  getUserInfo(e) {
    this.userInfo = e.detail.userInfo
  }

  get hasUserInfo() {
    return !!this.userInfo.nickName
  }
}
