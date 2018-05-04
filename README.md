## 微信小程序和 Mobx 的开发脚手架
为小程序添加数据管理库 Mobx

### 更新日志
[v1.0.5](docs/v1.0.5.md)

###  Installation

```
# 克隆仓库到指定的文件夹
$ git clone git@github.com:jokerapi/mini-program-starter-kit.git

# cd miniapp-mobx-starter-kit
```

### Develop
* 在项目根目录运行 `yarn`
* 在项目根目录运行 `yarn start`
* 打开微信Web开放者工具，将项目的跟目录导入进去，填写或选择相应信息
* 支持less语法

### Script
```
yarn start //开发模式
yarn staging //部署
yarn build //部署
```

### JS
* 支持es6新语法，新的Api不会转换。
* 支持装饰器
* 支持flow

### css
* px2rpx

  样式文件里，px会转成rpx, 倍率可配置


### Global
可以在 gulpfile.js 设置全局变量注入到代码里
```
const settings = {
  ipv4,
  NODE_ENV: process.env.NODE_ENV || 'development',
}
```

### less
* 下划线开头的文件用于被主文件import，编译并打包进主文件。
  ```
  // 当前文件 app.less
  @import "styles/_variable";
  ```
  如果不加下划线的话会额外生成一个单独的css文件，不符合小程序配置规范的文件会变成无用的文件（但是不会报错）

* wxss [文件导入](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html#样式导入),
  wxss支持运行时的样式导入，借助less的语法可以做到编译时不把import的文件内容打包进来，而是分开打包成两个文件
  ```
  // 当前文件 app.less
  @import (css) "styles/share.wxss"; // 源文件后缀可以是less、css、wxss
  ```
  编译后
  ```
  // 当前文件 app.wxss
  @import "styles/share.wxss";
  ```

### observer 使用
```
import { observer, userStore } from '@store'

observer({
  props: {
    user: userStore
  }，
  data: {
    topics: []
  },
  onLoad(){
  
  }
})

// 可以在wxml里面访问 user 了
// 或者

observer({
  get props() {
    // onLoad 后会执行这个方法，可以通过 this.options 访问页面参数
    return {
      user: userStore
    }
  }，
  data: {
    topics: []
  },
  onLoad(){
  
  }
})
```
