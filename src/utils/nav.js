import qs from 'qs';

class Nav {
  tabPages = [
    '/pages/root/home'
  ]

  tabQueryList = {
    '/pages/root/home': {},
  }

  get currentPage() {
    const pages = getCurrentPages();
    return pages[pages.length - 1];
  }

  get prevPage() {
    const pages = getCurrentPages();
    return pages[pages.length - 2];
  }

  goHome() {
    return wxp.reLaunch({ url: '/pages/root/home' });
  }

  isTabPage(url = this.currentPage.route) {
    const reg = new RegExp(url);
    return !!this.tabPages.find(item => reg.test(item));
  }

  navigateTo(options) {
    const { url } = options;

    // 处理超过十级页面无法跳转问题
    const pages = getCurrentPages();
    const navType = pages.length < 10 ? 'navigateTo' : 'redirectTo';
    return wxp[navType]({ ...options, url });
  }

  redirectTo(options) {
    return wxp.redirectTo(options);
  }

  reLaunch(options) {
    return wxp.redirectTo(options);
  }

  switchTab(options) {
    const { url } = options;
    const [link, search] = url.split('?');
    // 支持跳转 tab 时，传递参数，一般是 url 来源 api
    this.tabQueryList[url] = qs.parse(search);
    wxp.switchTab({ ...options, url: link });
  }

  navigateBack(options = {}) {
    const { delta = 1 } = options;
    const pages = getCurrentPages();
    const canBack = pages.length > delta;
    canBack ? wxp.navigateBack(options) : this.goHome();
  }

  nav(link) {
    if (link) {
      if (/^http/.test(link)) {
        this.navigateTo({ url: `/pages/extra/web-site?src=${encodeURIComponent(link)}` });
      } else if (this.isTabPage(link)) {
        this.switchTab({ url: link });
      } else {
        this.navigateTo({ url: link });
      }
    }
  }
}

export const nav = new Nav();
