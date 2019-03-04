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
yarn staging //部署
yarn build //部署
yarn lint // 用于 ci 的 esling 检查
```

## css
1. 使用 less 作为开发语言
2. px2rpx，less 里不使用 rpx，编译时通过工具转成rpx，需要强制使用px时，使用大写(PX)

## babel 
通过 babel 支持 es6+ 的语法，解决小程序 ide 自带的 babel 不支持的语法（例如 async 和 装饰器）

## npm 支持
可以在 js 中引入 npm 的包

## alias
通过 `babel-plugin-module-resolver` 支持 require 的路径别名配置

`require('@/store')` `@`指 src 的目录

## wxp
全局变量 wxp，对 wx 的 api 进行 Promise 封装 

## 网络请求
使用 `flyio` 库封装网络请求

[后端接口配置](src/utils/env.js)，可以区分不同环境变量来配置

## 环境变量
```
process.env.PORT： 默认为 3000
process.env.API_URL：默认根据 PORT 组成本地后端接口的 url
process.env.NODE_ENV
```
支持通过 `.env` 文件修改环境变量，[参考](https://www.npmjs.com/package/node-env-file)

## ewx 模板引擎
[参考 ewx 文档](docs/ewx.md)

### mobx 使用
[参考 ewx 文档](docs/ewx.md)
[ewx 和 mobx 结合开发建议](docs/mobx.md)
