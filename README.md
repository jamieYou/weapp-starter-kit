## 微信小程序和 Mobx 的开发脚手架
为小程序添加数据管理库 Mobx

### 更新日志
[v1.5.0](docs/ewx.md)

[v1.2.0](docs/v1.2.0.md)

[v1.1.0](docs/v1.1.0.md)

[v1.0.5](docs/v1.0.5.md)

###  Installation

```
# 克隆仓库到指定的文件夹
$ git clone git@github.com:jokerapi/mini-program-starter-kit.git
$ cd miniapp-mobx-starter-kit
$ cp project.config.json.example project.config.json
```

### Develop
* 在项目根目录运行 `yarn`
* 在项目根目录运行 `yarn start`
* 打开微信Web开放者工具，将项目的跟目录导入进去，填写或选择相应信息

### Script
```
yarn start //开发模式
yarn staging //部署
yarn build //部署
```

### css
	1. 使用 less 作为开发语言，less 编译不使用增量编译，提高稳定性
	2. px2rpx，less 里不使用 rpx，编译时通过工具转成rpx，需要强制使用px时，使用大写(PX)

### mobx 使用
[参考](docs/ewx.md)
