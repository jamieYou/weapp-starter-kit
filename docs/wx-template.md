# 快速生成页面、组件模版

## 生成组件
### 全局组件
`yarn wx -n 名字`

自动生成组件到 `components` 目录，并在 `app.json` 添加引用

### 页面内组件
`yarn wx src/pages/ewx-demo -n 名字`

自动生成组件到 `src/pages/ewx-demo` 目录，并在 `ewx-demo.json` 添加引用

## 生成页面
`yarn wx -n 名字 --page`
自动生成页面到 `pages` 目录，并在 `app.json` 添加引用
