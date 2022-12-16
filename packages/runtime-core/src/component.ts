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
}
