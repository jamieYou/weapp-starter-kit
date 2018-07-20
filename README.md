## 微信小程序和 Mobx 的开发脚手架
为小程序添加数据管理库 Mobx

### 更新日志
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
	1. 使用 less 作为开发语言，less 编译不使用增量编译，提高稳定性
	2. px2rpx，less 里不使用 rpx，编译时通过工具转成rpx，需要强制使用px时，使用大写(PX)


### Global
可以在 gulpfile.js 设置全局变量注入到代码里
```
const settings = {
  ipv4,
  NODE_ENV: process.env.NODE_ENV || 'development',
}
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

### 异步 action 的使用
[参考](https://cn.mobx.js.org/best/actions.html#flows)
```
class Test {
  @fetchAction.flow
  async* update() {
    yield promise
    // this.data.....
  }

  // 不使用 fetchAction 的情况
  @asyncAction
  async* update() {
    yield promise
    // this.data.....
  }  
}
```
