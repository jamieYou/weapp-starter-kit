const p = require('./config/ewx-parse')
// const { parseMustache } = require('./config/ewx-parse/parse-mustache')
//
// console.warn(parseMustache('a.b.c + b.c() + a'))

const str = `
<view class="{{ user.info(user.get()) }}">
<view wx:for="{{ list }}">
  <text bind:tap="{{ ()=> this.click(item) }}">{{  user.name  }}</text>
</view>
</view>
`

console.warn(p(str))
