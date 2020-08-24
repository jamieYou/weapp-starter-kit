const through = require('through2')

// 默认参数
const opts = {
  baseDpr: 1,
  viewportUnit: 'rpx',
  minPixelValue: 1,
  precision: 2,
}
const ZPXRegExp = /(\d+)px/

function createPxReplace({ minPixelValue, baseDpr, viewportUnit, precision }) {
  return function ($0, $1) {
    if (!$1) return
    const pixels = parseFloat($1)
    if (pixels <= minPixelValue) return $1 + 'px'
    return toFixed(pixels / baseDpr * 2, precision) + viewportUnit
  }
}

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier)
  return Math.round(wholeNumber / 10) * 10 / multiplier
}

function px2rpx() {
  return through.obj(
    function (file, encoding, cb) {
      if (file.isNull()) return cb(null, file)

      let _source = file.contents.toString()
      let pxGlobalRegExp = new RegExp(ZPXRegExp.source, 'g')
      if (pxGlobalRegExp.test(_source)) {
        _source = _source.replace(pxGlobalRegExp, createPxReplace(opts))
      }

      file.contents = Buffer.from(_source, 'utf-8')
      this.push(file)
      cb()
    }
  )
}

module.exports = px2rpx
