# ewx

ewx 是一个基于 wxml 扩展的小程序 html 模板。主要功能是扩展 wxml 的数据绑定（可以调用函数等），并和 mobx 结合，使用 mobx 作为状态管理。

# ewx 对 wxml 的扩展
1. 函数调用
```html
<view wx:if="{{ [1,2].includes(1) }}">{{"hello" + name}}</view>
```

2. 事件绑定可以传递一个函数
```
<view wx:for="{{array}}" bindtap="{{ ()=> click(item) }}">
  {{index}}: {{item.message}}
</view>
```

# ewx 对 js 层的扩展
使用类来声明页面和组件
```
// demo.js
import { WeApp, createPage } from '@/store'

@createPage(require)
export class Demo extends WeApp {
  title = 'weapp'

  // 生命周期和其他微信的回调方法
  onLoad() {
    // Do some initialize when page load.
  }

  // 自定义方法
  handle() {
    this.title = 'hello'
  }
  
  getFullTitle() {
    return this.title + '-mobx'
  }
}
```
```html
// demo.ewx -> 使用 .ewx, 而不是 .wxml
<view bindtap="handle">{{ title }}  {{ getFullTitle() }}</view>
```
在这个类中没有小程序的 data、setData。所有实例变量(例如 title)都是响应式的 模板里可以绑定实例的变量和方法，实例里数据的发生改变也会同步到视图层(wxml)。
响应式数据的 api 是由 mobx 提供的，因此在实例里面也可以引用全局的 mobx 数据，从而实现全局状态管理。

# api 介绍
## Component 声明
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
      // 属性被改变时执行的函数（可选），也可以写成实例中定义的方法名字符串, 如：'myPropertyChange'
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
Component 的配置目前只支持 `properties`, `options`, `externalClasses`, 这三个参数都是静态属性，跟实例没有直接关系的。

## scope

可以通过 `this.$scope` 访问原生的实例(页面或组件)

## update 

需要设置 `setData` 回调时改用 `update` api
```
this.update({ title: 'abc' }, ()=> {}) // 和 setData 类似，但是更新的目标是当前的 this
```

## props

通过 `this.props` 可以到获取参数(页面里是当前的路由参数对象，组件里是传递进来的 properties)

## template
`.ewx` 声明 template 的标签时，内部的标签内容不支持 `.ewx` 的语法，只能采用原生的语法

`.ewx` 调用模版时的语法 `<template is="item" data="{{ {text: 'forbar'} }}"/>` 和 `.wxml` 调用模版时的语法 `<template is="item" data="{{text: 'forbar'}}"/>` 不同

## include 
`<include src="" />` 内部的 wxml 暂不支持`.ewx` 的语法
