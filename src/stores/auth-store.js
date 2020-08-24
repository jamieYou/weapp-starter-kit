import { observable } from 'mobx'
import { SimpleStore } from './helper/simple-store';
import { ACCESS_TOKEN_KEY } from '@/constants';
import User from '@/models/user';
import { request } from '@/utils';

class AuthStore extends SimpleStore {
  @observable $access_token = wxp.getStorageSync(ACCESS_TOKEN_KEY)
  user = new User

  async checkLogin() {
    if (this.token) {
      try {
        await wxp.checkSession();
        return this.token;
      } catch (e) {
        return this.login();
      }
    }
    return this.login();
  }

  async login() {
    const { code } = await wxp.login();
    const { data: { access_token, user } } = await request.post('/users/token', { code });
    this.user = new User(user);
    return this.access_token = access_token;
  }

  set access_token(v) {
    this.$access_token = v;
    wxp.setStorageSync(ACCESS_TOKEN_KEY, v);
  }

  get access_token() {
    return this.$access_token;
  }
}

export const authStore = AuthStore.create();
