import checkApiAuth from './check-api-auth';

/**
 * 保存图片或视频到本地相册
 *
 * @param  {String|Array} urls        媒体文件本地链接或网络链接
 * @param  {String} mediumType       标识保存的是图片还是视频，默认保存图片
 */
export async function saveFiles(urls, mediumType = 'image') {
  const method = mediumType === 'video' ? 'saveVideoToPhotosAlbum' : 'saveImageToPhotosAlbum';
  await checkApiAuth(method, {}, false);
  await saveToPhotosAlbum(urls, method);
}

async function saveToPhotosAlbum(urls, method) {
  for (const url of [].concat(urls)) {
    let filePath;
    if (/^wxfile/.test(url) || /^http:\/\/tmp\//.test(url)) {
      filePath = url;
    } else {
      const { tempFilePath } = await wxp.downloadFile({ url });
      filePath = tempFilePath;
    }
    await wxp[method]({ filePath });
  }
}
