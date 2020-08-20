import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 此处不用class的原因是因为方便 后续给vue实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用_init方法
  this._init(options)
}
// 注册vm 的_init方法 初始化vm
initMixin(Vue)
// 注册vm的$data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关方法 $on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期相关的混入方法 _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 混入 render  $nextTick/_render
renderMixin(Vue)

export default Vue
