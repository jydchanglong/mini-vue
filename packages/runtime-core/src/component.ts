import { reactive } from '@vue/reactivity'
import { isFunction, isObject } from '@vue/shared'
import { onBeforeMount, onMounted } from './apiLifecycle'

// 生命周期钩子
export const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm'
}

let uid = 0

export function createComponentInstance(vnode) {
  const type = vnode.type

  const instance = {
    uid: uid++,
    vnode,
    type,
    subTree: null, // render 函数的返回值
    effect: null,
    update: null, // 触发 effect.run
    render: null,
    // 生命周期相关
    isMounted: false,
    bc: null,
    c: null,
    bm: null,
    m: null
  }

  return instance
}

export function setupComponent(instance) {
  const setupResult = setupStatefullComponent(instance)
  return setupResult
}

function setupStatefullComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  } else {
    finishComponentSetup(instance)
  }
}

export function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  }
  finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  const Component = instance.type

  if (!instance.render) {
    instance.render = Component.render
  }
  // 改变 options 中 this 的指向
  applyOptions(instance)
}

function applyOptions(instance) {
  const {
    data: dataOptions,
    beforeCreate,
    created,
    beforeMount,
    mounted
  } = instance.type

  if (beforeCreate) {
    callHook(beforeCreate, instance.data)
  }

  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }

  if (created) {
    callHook(created, instance.data)
  }

  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)

  function registerLifecycleHook(register: Function, hook?: Function) {
    register(hook?.bind(instance.data), instance)
  }
}

function callHook(hook: Function, proxy) {
  hook.bind(proxy)()
}

let compile

export function registerRuntimeCompiler(_compile: any) {
  compile = _compile
}
