export default new class {
  systemInfo = {}

  constructor() {
    this.setSystemInfo();
  }

  setSystemInfo() {
    try {
      this.systemInfo = wxp.getSystemInfoSync();
    } catch (error) {
      this.systemInfo = wxp.getSystemInfoSync();
    } finally {
      this.systemInfo.platform || (this.systemInfo = wxp.getSystemInfoSync());
    }
  }

  isFullScreenModel() {
    return this.isIphone11 || this.isIphoneX;
  }

  /**
   * iPhone X: iPhone10,3 / iPhone10,6
   * iPhone XR: iPhone11,8
   * iPhone XS: iPhone11,2
   * iPhone 11: iPhone12,1
   * iPhone 11 Pro: iPhone12,3
   * iPhone XS Max: iPhone11,6 / iPhone11,4
   * iPhone 11 Pro Max: iPhone12,5
   */
  get isIphoneX() {
    const { model } = this.systemInfo;
    return /iPhone10,3|iPhone10,6|iPhone11,8|iPhone11,1|iPhone11,2|iPhone11,3|iPhone11,6|iPhone11,4|iPhone12,5/ig.test(model);
  }

  get safeBottom() {
    return this.isIphoneX ? '32rpx' : '';
  }

  get isIOS() {
    const { platform } = this.systemInfo;
    if (platform) {
      return platform.toUpperCase() === 'IOS';
    } else {
      return false;
    }
  }
};
