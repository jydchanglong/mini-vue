import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, Text } from './vnode'

export interface RendererOptions {
  /**
   * 为指定 element 的 prop 打补丁
   */
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  /**
   * 为指定的 Element 设置 text
   */
  setElementText(node: Element, text: string): void
  /**
   * 插入指定的 el 到 parent 中，anchor 表示插入的位置，即：锚点
   */
  insert(el, parent: Element, anchor?): void
  /**
   * 创建指定的 Element
   */
  createElement(type: string)
}

export function createRenderer(options: RendererOptions) {
  return createBaseRenderer(options)
}

function createBaseRenderer(options: RendererOptions): any {
  /**
   * 解构获取 DOM 操作相关方法
   */
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载
      mountElement(newVNode, container, anchor)
    } else {
      // 更新
    }
  }

  /**
   * 挂载 Element
   */
  const mountElement = (vnode, container, anchor) => {
    const { type, shapeFlag, props } = vnode
    // 1. 创建节点
    const el = (vnode.el = hostCreateElement(type))
    // 2. 设置子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 设置文本节点
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 设置数组子节点
    }
    // 3. 设置属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 4. 插入节点到指定位置
    hostInsert(el, container, anchor)
  }
  /**
   * 补丁函数
   */
  const patch = (oldVNode, newVNode, container, anchor = null) => {
    // 如果新旧 vnode 一样，则直接返回
    if (oldVNode === newVNode) {
      return
    }
    const { type, shapeFlag } = newVNode
    switch (type) {
      case Text:
        break
      case Comment:
        break
      case Fragment:
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
        }
        break
    }
  }
  /**
   * 渲染函数
   */
  const render = (vnode, container) => {
    if (vnode === null) {
      // 卸载
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  return {
    render
  }
}
