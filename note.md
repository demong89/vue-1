## 准备工作
#### Vue源码获取
[项目地址](https://github.com/vuejs/vue)
fork一份到自己仓库
[vue3.0地址](https://github.com/vuejs/vue-next)
#### 源码目录结构
 src
    - compiler  编译相关
    - core      Vue核心库
    - platforms 平台相关代码
    - server    SSR服务端渲染
    - sfc       .vue文件编译为JS对象
    - shard     公共的代码
#### Flow 
JS的静态类型检查器
[官网](https://flow.org/)
[参考-3、flow](https://blog.csdn.net/guo187/article/details/107052501)
#### 调试设置
+ 打包工具 Rollup
+ 安装依赖 `npm i`
+ 设置sourcemap
    - package.json文件中的dev脚本中添加参数 --sourcemap
    ` "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",`
+ 执行dev
    `npm run dev` dist文件夹下出现vue.js文件
#### 调试
+ examples的示例中引入的vue.min.js改为vue.js
+ chrome调试工具source

## vue的不同构建版本
npm run build 重新打包

[参考](https://cn.vuejs.org/v2/guide/installation.html#%E5%AF%B9%E4%B8%8D%E5%90%8C%E6%9E%84%E5%BB%BA%E7%89%88%E6%9C%AC%E7%9A%84%E8%A7%A3%E9%87%8A)
+ 完整版：同时包含编译器和运行时的版本
+ 编译器：用来将模板字符串编译成为 JavaScript 渲染函数的代码。将template转换为render函数
+ 运行时：用来创建 Vue 实例、渲染并处理虚拟 DOM 等的代码。基本上就是除去编译器的其它一切。

+ UMD  UMD 版本通用的模块版本，支持多种模块方式。 vue.js 默认文件就是运行时 + 编译器的UMD 版本
+ commonjs(cjs) CommonJS 版本用来配合老的打包工具比如 Browserify 或 webpack 1。
+ ESM  从 2.6 开始 Vue 会提供两个 ES Modules (ESM) 构建文件，为现代打包工具提供的
版本。
    - ESM 格式被设计为可以被静态分析，所以打包工具可以利用这一点来进行“tree-shaking”并将用不到的代码排除出最终的包。
    - [ES6\commonJS区别](https://es6.ruanyifeng.com/#docs/module-loader#ES6-%E6%A8%A1%E5%9D%97%E4%B8%8E-CommonJS-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82)


+ 推荐使用运行时版本，因为运行时版本相比完整版体积要小大约 30%

+ 基于 Vue-CLI 创建的项目默认使用的是 vue.runtime.esm.js
 - 通过查看 webpack 的配置文件`vue inspect > output.js`
 注意： *.vue 文件中的模板是在构建时预编译的，最终打包后的结果不需要编译器，只需要运行
时版本即可

#### 去除源码报错
VScode-- 首选项--设置 搜validate  JavaScript validate 设为false

Babel JavaScript 插件 解决泛型下面代码不高亮的问题


## 入口文件
#### 查找入口文件
"dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev"
+ script/config.js文件的执行
    - 作用：生成 rollup 构建的配置文件
    - 使用环境变量 TARGET = web-full-dev
![config](./img/config.png)
+ genConfig(name)函数
    - 根据环境变量 TARGET 获取配置信息
    - builds[name] 获取生成配置的信息  builds是个对象 ` const opts = builds[name]`
+ resolve函数 - builds里用到
    - 获取入口和出口文件的绝对路径
把 src/platforms/web/entry-runtime-with-compiler.js 构建成 dist/vue.js，如果设置 --
sourcemap 会生成 vue.js.map  
src/platform 文件夹下是 Vue 可以构建成不同平台下使用的库，目前有 weex 和 web，还有服务
器端渲染的库   

#### 从入口文件开始
src/platforms/web/entry-runtime-with-compiler.js
Q：同时声明template和render ， 优先执行哪个？
```
const vm = new Vue({ el: '#app', template: '<h3>Hello template</h3>', render (h) { return h('h4', 'Hello render') } }) 
```
+ el不能是body 或者 HTML
+ 把 template/el 转换成render函数
+ 如果有render方法，直接调用mount方法 挂载DOM

#### vue的构造函数在哪里

+ src/platform/web/entry-runtime-with-compiler.js 中引用了  './runtime/index'
+ src/platform/web/runtime/index.js
    - 设置Vue.config
    ```
    Vue.config.mustUseProp = mustUseProp
    Vue.config.isReservedTag = isReservedTag
    Vue.config.isReservedAttr = isReservedAttr
    Vue.config.getTagNamespace = getTagNamespace
    Vue.config.isUnknownElement = isUnknownElement
    ```
    - 设置平台相关的指令和组件
        - 设置v-model、v-show `extend(Vue.options.directives, platformDirectives)`
        - 组件 transition 、 transition-group `extend(Vue.options.components, platformComponents)`
    - 设置平台相关的_patch_方法 （打补丁方法，对比新旧的VNode） `Vue.prototype.__patch__ = inBrowser ? patch : noop`
    - 设置$mount方法，挂载DOM 
    ```
    Vue.prototype.$mount = function (
        el?: string | Element,
        hydrating?: boolean
        ): Component {
        el = el && inBrowser ? query(el) : undefined
        return mountComponent(this, el, hydrating)
    }
    ```
+ src/platform/web/runtime/index.js 中引用了  'core/index'
+ src/core/index.js
 - 定义了Vue的静态方法
 - initGlobalAPI(Vue)
+ src/core/index.js 中引用了 './instance/index'
+ src/core/instance/index.js
    - 定义了vue的构造函数

#### 四个导出Vue的模块
+ src/platforms/web/entry-runtime-with-compiler.js
    - web平台相关的入口
    - 重写了平台相关的$mount方法
    - 注册了Vue.compile()方法，传递一个HTML字符串返回render函数 
+ src/platforms/web/runtime/index.js
    - web相关平台
    - 注册和平台相关的全局指令 v-model v-show
    - 注册和平台相关的全局组件 v-transition v-transition-group
    - 全局方法
        - _patch_  把虚拟DOM转换成真实的DOM
        - $mount 挂载方法
+ src/core/index.js
    - 与平台无关
    - 设置了vue的静态方法 initGlobalAPI(Vue)
+ src/core/instance/index.js
    - 与平台无关
    - 定义了构造函数，调用了this._init(options)方法
    - 给Vue中混入了常用的实例成员

## Vue的初始化
#### src/core/global-api/index.js
+ 初始化vue的静态方法
    - src/core/index.js
    ```
    // 注册vue的静态属性 、方法
    initGlobalAPI(Vue) 
    ```
#### src/core/instance/index.js
+ 定义vue的构造函数
+ 初始化vue的实例成员
+ initMixin(Vue)
    - 初始化_init()方法 // src\core\instance\init.js

## 首次渲染过程 
![首次渲染](./img/首次渲染.png)
+ Vue初始化完毕，开始真正的执行
+ 调用new Vue() 之前，已经初始化完毕

## 数据响应式原理
#### Q
+ vm.msg = { count: 0 } ，重新给属性赋值，是否是响应式的？
+ vm.arr[0] = 4 ，给数组元素赋值，视图是否会更新
+ vm.arr.length = 0 ，修改数组的 length，视图是否会更新
+ vm.arr.push(4) ，视图是否会更新

#### 响应式处理的入口
+ src\core\instance\init.js
    - initState(vm) vm状态的初始化
    - 初始化了_data _props methods computed watch
+ src\core\instance\state.js
```
// 数据的初始化 initState()方法
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
```
+ initData(vm) vm数据的初始化 src\core\instance\state.js
+ src\core\observer\index.js
    - observe(value,asRootData)
    - 负责为每一个Object类型的value创建一个observer实例

#### Observer
+ src\core\observer\index.js 
    - 对对象做响应化处理
    - 对数组做响应化处理
+ walk(obj)
    - 遍历obj的所有属性，为每一个属性调用defineReactive() 设置getter / setter
#### defineReactive()
+ src\core\observer\index.js
+ defineReactive (obj,key,val,customSetter,shallow)
    - 为一个对象定义一个响应式的属性，每一个属性对应一个dep对象
    - 如果该属性的值是对象 继续调用observer
    - 如果给属性赋新值 继续调用observer
    - 如果数据更新发出通知
+ 对象响应式处理
+ 数组的响应式处理
    - Observer的构造函数中
    - 处理数据修改数据的方法
        - src\core\observer\array.js
#### Dep类
#### watcher类

## 实例方法/数据
## 异步更新队列

## 虚拟DOM


## 模板编译和组件化
