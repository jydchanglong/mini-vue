import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandler'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

const reactiveMap = new WeakMap<object, any>()

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxy[ReactiveFlags.IS_REACTIVE] = true
  proxyMap.set(target, proxy)
  return proxy
}

export const toReactive = <T extends unknown>(value: T): T => {
  return isObject(value) ? reactive(value as object) : value
}

export const isReactive = value => {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
