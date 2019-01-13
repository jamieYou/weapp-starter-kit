# weapp 体验版文档

## 功能说明
1. page、component 的声明方式修改为 class
2. 模版文件里面可以访问 class 里面的方法和属性
3. 优化 mobx 和小程序的结合

## 创建页面例子
```
// demo.js
import { WeApp, createPage } from '@weapp'

@createPage(require)
export class Demo extends WeApp {
  title = 'weapp'

  // 生命周期和其他微信的回调方法
  onLoad() {
    // Do some initialize when page load.
  }

  onReady() {
    // Do something when page ready.
  }

  onShow() {
    // Do something when page show.
  }

  onHide() {
    // Do something when page hide.
  }

  onUnload() {
    // Do something when page close.
  }

  // 自定义方法
  handle() {

  }
  
  getFullTitle() {
    return this.title + '-mobx'
  }
}
```

```
// demo.weapp -> 使用 .weapp, 而不是 .wxml
<view bindtap="handle">{{ getFullTitle() }}</view>
```

## 创建组件例子
```
import { WeApp, createComponent } from '@weapp'

@createComponent(require)
export class Counter extends WeApp {
  // Component构造器下的配置
  static properties = {
    myProperty: { // 属性名
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: 'myPropertyChange'
      // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'myPropertyChange'
    },
  }
  static options = {}
  static externalClasses = {}

  // 生命周期函数
  attached() { }
  moved() { }
  detached() { }
  
  // 组件所在页面的生命周期函数
  show() { }
  hide() { }
  resize() { }
  
  // 自定义方法
  handle() {
  
  }
  
  myPropertyChange() {
  
  }
}

```

## 状态管理
weapp 使用 mobx 做状态管理

### 例子1, 自定义 observable 和自定义 action 结合
```
import { WeApp, createPage } from '@weapp'
import { action, observable } from 'mobx'

@createPage(require)
export class Demo extends WeApp {
  @observable title = ''
  
  @action
  setTitle() {
    this.title = 'abc'
  }
}
```

### 例子2, 普通属性和强制更新方法(update)
```
import { WeApp, createPage } from '@weapp'

@createPage(require)
export class Demo extends WeApp {
  title = ''
  
  setTitle() {
    this.update({ title: 'abc' }, ()=> {}) // 和 setData 类似，但是更新的目标是当前的 this
  }
}
```

### 例子3, 内置 observable
```
import { WeApp, createPage } from '@weapp'

@createPage(require)
export class Demo extends WeApp {
  store = { title: '' } // 父类已经声明为 observable 对象, 不用手动装饰
  
  @action
  setTitle1() {
    this.store.title = 'abc'
  }  
  
  setTitle2() {
    this.update({ 'store.title': 'abc' }, ()=> {}) update 方法也可以更新 observable 对象
  }
}
```

## props 
通过 this.props 可以到获取参数(页面里是当前的路由参数对象，组件里是传递进来的 properties)

## template
`.weapp` 不兼容声明 template，可以从外部引入 `.wxml`

`.weapp` 调用模版时的语法 `<template is="item" data="{{ {text: 'forbar'} }}"/>` 和 `.wxml` 调用模版时的语法 `<template is="item" data="{{text: 'forbar'}}"/>` 不同

## 要点
1. 每次进入页面、初始化组件时，都会重新 new class
2. class 里面没有内置的 data、setData 功能
3. 通过 this.$scope 获取原来的页面、组件实例对象
4. `.weapp` 不兼容 include
