## ewx 和 mobx-multiple-store 结合开发建议

1. 尽量使用内部 store
  
   以往使用 mobx 的问题，只要是 api 的数据都抽到公共 store，写一个 store 需要涉及到创建文件、继承类、导出 store、引入 stroe，过程繁琐、对入门者来说也更难理解。

   建议内部数据尽量内部维护，非公用的就没必要抽取出来了。例子：
   ```
   import { WeApp, createPage } from '@/store'

    @createPage(require)
    export class Demo extends WeApp {
      api_data = {}
    
      onLoad() {
        // 请求 api
        // 合并 api 的请求结果
      }
    }
   ```
   或者创建 WebAPIStore
   ```
   import { WeApp, createPage, WebAPIStore } from '@/store'

    @createPage(require)
    export class Demo extends WeApp {
      store = new WebAPIStore({ data: [] })
    
      onLoad() {
        this.store.mergeFetched(/* 请求 api */) // 自动合并 api 的请求结果
      }
    }
   ```
2. 多 store 复用

   对于详情页这种每个数据都是单独的结构，如果抽取成全局 store 就不能使用同一个实例，每个详情的数据应该是独立的。
   
   `mobx-multiple-store` 提供 `WebAPIStore` 和 `StoreHelper` 两个类来动态创建 store
   
   ```
   import { WeApp, createPage, WebAPIStore } from '@/store'

    @createPage(require)
    export class Demo extends WeApp {
      store = WebAPIStore.findOrCreate(id, { data: [] })
    }
   ```
   使用 id 作为key，在其他页面再次调用 api 时即可获取之前创建的 store。
