## 微信小程序和 Mobx 的开发脚手架
为小程序添加数据管理库 Mobx

### mobx 使用
    参考 pages/demo 里的代码

###  Installation

```
# 克隆仓库到指定的文件夹
$ git clone git@github.com:jokerapi/mini-program-starter-kit.git

# cd miniapp-mobx-starter-kit
```

### Develop
* 在项目根目录运行 `yarn`
* 在项目根目录运行 `npm start` 或者 `npm run start:mock`
* 打开微信Web开放者工具，将下载的项目添加的 `/dist` 目录导入进去，填写或选择相应信息
* 创建新页面运行 `gulp generate --page '${page-name}'`
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

### less
* px2rpx

  样式文件里，px会转成rpx, 倍率可配置


### Global
可以在 gulpfile.js 设置全局变量
```
const settings = {
  ipv4,
  NODE_ENV: process.env.NODE_ENV || 'development',
}
```
