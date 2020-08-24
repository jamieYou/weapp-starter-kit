const SCOPE_MAP = {
  userInfo: '用户信息',
  userLocation: '地理位置',
  userLocationBackground: '后台定位',
  address: '通讯地址',
  invoiceTitle: '发票抬头',
  invoice: '发票',
  werun: '微信运动步数',
  record: '录音功能',
  writePhotosAlbum: '相册功能',
};

const SCOPES = {
  getUserInfo: 'userInfo',
  chooseLocation: 'userLocation',
  getLocation: 'userLocation',
  startLocationUpdateBackground: 'userLocationBackground',
  chooseAddress: 'address',
  chooseInvoiceTitle: 'invoiceTitle',
  chooseInvoice: 'invoice',
  getWeRunData: 'werun',
  startRecord: 'record',
  saveVideoToPhotosAlbum: 'writePhotosAlbum',
  saveImageToPhotosAlbum: 'writePhotosAlbum',
};

/**
 * 自动检查并获取手机权限
 *
 * @param  {String}  scope          需要调用的小程序API，取值 SCOPES
 * @param  {Object}  options        调用API传的参数，默认空对象{}
 * @param  {Boolean} isAuto         是否自动调用相对应的API，默认 true
 *
 * @return {Object|Boolean}         返回API调用后的返回值，如果 isAuto 为 false，打开权限后return true，用户拒绝 return false
 */
async function checkApiAuth(scope, options = {}, isAuto = true) {
  const fullScope = SCOPES[scope];
  const { authSetting } = await wxp.getSetting();
  const isFirst = !Object.prototype.hasOwnProperty.call(authSetting, `scope.${fullScope}`);

  try {
    if (!authSetting[`scope.${fullScope}`]) {
      await wxp.authorize({ scope: `scope.${fullScope}` });
    }
    const res = isAuto ? (await wxp[scope](options)) : true;
    return res;
  } catch (e) {
    if (e.errMsg.indexOf('authorize:fail') !== -1) {
      if (isFirst) {
        return false;
      }
      const { confirm } = await wxp.showModal({ content: `授权失败，请在设置中打开“${SCOPE_MAP[fullScope]}”开关后继续操作`, confirmText: '去设置' });
      if (confirm) {
        const { authSetting } = await wxp.openSetting();
        if (authSetting[`scope.${fullScope}`]) {
          return true;
        }
      }
      return false;
    }
    throw e;
  }
}

export default checkApiAuth;
