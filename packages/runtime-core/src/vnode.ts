import { isArray, isFunction, isObject, isString } from '@vue/shared'
import { normalizeClass } from 'packages/shared/src/normalizeProp'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'

export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlag: number
  key: any
}

export const Text = Symbol('Text')
export const Comment = Symbol('Comment')
export const Fragment = Symbol('Fragment')

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

export function createVNode(type, props, children): VNode {
  if (props) {
    // 处理 class
    const { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

export { createVNode as createElementVNode }

function createBaseVNode(type, props, children, shapeFlag) {
  // 这里是精简过的 vnode
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag,
    key: props?.key || null
  } as VNode

  normalizeChildren(vnode, children)
  return vnode
}

export function normalizeChildren(vnode, children) {
  let type = 0
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.children = children
  vnode.shapeFlag |= type
}

export function isSameVNodeType(oldVNode: VNode, newVNode: VNode) {
  return oldVNode.type === newVNode.type && oldVNode.key === newVNode.key
}
