import { track, trigger } from './effect'

const get = createGetter()
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const result = Reflect.get(target, key, receiver)
    // 收集依赖
    track(target, key)
    return result
  }
}

const set = createSetter()
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    const result = Reflect.set(target, key, value, receiver)
    // 触发依赖
    trigger(target, key, value)
    return result
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
