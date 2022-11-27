import { EMPTY_OBJ } from '@vue/shared'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, isSameVNodeType, Text } from './vnode'

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
  /**
   * 卸载 dom
   */
  remove(el: Element): void
  /**
   * 创建 Text 节点
   */
  createText(text: string)
  /**
   * 更新 Text 节点
   */
  setText(node, text): void
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
    setElementText: hostSetElementText,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText
  } = options

  const processText = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载节点
      newVNode.el = hostCreateText(newVNode.children as string)
      hostInsert(newVNode.el, container, anchor)
    } else {
      // 更新节点
      const el = (newVNode.el = oldVNode.el!)
      if (oldVNode.children !== newVNode.children) {
        hostSetText(el, newVNode.children as string)
      }
    }
  }

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载
      mountElement(newVNode, container, anchor)
    } else {
      // 更新
      patchElement(oldVNode, newVNode)
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
   * 更新 Element
   */
  const patchElement = (oldVNode, newVNode) => {
    // debugger
    const el = (newVNode.el = oldVNode.el!)
    const oldProps = oldVNode.props
    const newProps = newVNode.props
    // 更新 children
    patchChildren(oldVNode, newVNode, el, null)

    // 更新 props
    patchProps(el, newVNode, oldProps, newProps)
  }

  /**
   * 为子节点打补丁
   */
  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    // 旧节点
    const c1 = oldVNode && oldVNode.children
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    // 新节点
    const c2 = newVNode.children
    const { shapeFlag } = newVNode
    // 如果新子节点为 TEXT_CHILDREN
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果旧子节点为 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 卸载旧节点
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2)
      }
    } else {
      // 如果旧子节点是 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 如果新子节点也是 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff 运算
        } else {
          // 新子节点不是 ARRAY_CHILDREN，则直接卸载旧节点
        }
      } else {
        // 如果旧子节点是 TEXT_CHILDREN
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧文本
          hostSetElementText(container, '')
        }
        // 新子节点为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 挂载新子节点
        }
      }
    }
  }
  /**
   * 为 props 打补丁
   */
  const patchProps = (el, newVNode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      // 遍历新属性，更新 props
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        // 如果新属性里不包含旧属性，旧删除旧属性
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }
  /**
   * 补丁函数
   */
  const patch = (oldVNode, newVNode, container, anchor = null) => {
    // 如果新旧 vnode 一样，则直接返回
    if (oldVNode === newVNode) {
      return
    }

    // 判断是否为相同节点类型
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode
    switch (type) {
      case Text:
        processText(oldVNode, newVNode, container, anchor)
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
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  const unmount = vnode => {
    hostRemove(vnode.el!)
  }

  return {
    render
  }
}
