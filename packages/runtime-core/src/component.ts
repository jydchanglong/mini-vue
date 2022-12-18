import { reactive } from '@vue/reactivity'
import { isObject } from '@vue/shared'

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
    render: null
  }

  return instance
}

export function setupComponent(instance) {
  const setupResult = setupStatefullComponent(instance)
  return setupResult
}

function setupStatefullComponent(instance) {
  finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  const Component = instance.type
  instance.render = Component.render
  // 改变 options 中 this 的指向
  applyOptions(instance)
}

function applyOptions(instance) {
  const { data: dataOptions } = instance.type

  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }
}
