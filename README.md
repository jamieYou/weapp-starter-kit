# 微信小程序开发脚手架

##  Installation

```
# 克隆仓库到指定的文件夹
$ git clone git@github.com:jamieYou/weapp-starter-kit.git
$ cd weapp-starter-kit
$ cp project.config.json.example project.config.json
```

## Develop
* 在项目根目录运行 `yarn`
* 在项目根目录运行 `yarn start`
* 打开微信Web开放者工具，将项目的跟目录导入进去，填写或选择相应信息

## Script
```
yarn start //开发模式
NODE_ENV=xxx yarn build //部署 # NODE_ENV 默认为 production 
yarn lint // 用于 ci 的 esling 检查
```

## css
1. 使用 scss 作为开发语言
2. 页面、组件以外的 scss 文件，请以 _ 开头或者放在 styles 目录

## npm 支持
可以在 js 中引入 npm 的包

## alias
通过 `babel-plugin-module-resolver` 支持 require 的路径别名配置

`require('@/store')` `@`指 src 的目录

## wxp
全局变量 wxp，对 wx 的 api 进行 Promise 封装 

## 环境变量
支持通过 `.env` 文件修改环境变量，[参考](https://www.npmjs.com/package/node-env-file)

## Observer
让页面和 mobx 结合使用

```javascript
Observer.Page({
  state() {
    return {
      show: true,
      authStore,
      list: new Collection,
    }
  },
  computed: {
    get nickname() {
      return authStore.user.nickname
    }
  },
  onLoad() {
    // state 和 computed 设置到 this 上，并同步到 data
    this.authStore;
    this.nickname;
  }
})
```
支持页面、组件(Observer.Component)、Behavior(Observer.Behavior)，其他参数按照官方文档即可
