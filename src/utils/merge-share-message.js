export default function mergeShareMessage(config = {}) {
  let { title, path, imageUrl } = config

  if (/^http/.test(path)) {
    path = `/pages/extra/web-site/index?src=${encodeURIComponent(path)}`
  } else if (!path) {
    path = '/pages/root/home/index'
  }

  if (!imageUrl) {
    imageUrl = ''
  }

  return { title, path, imageUrl }
}
