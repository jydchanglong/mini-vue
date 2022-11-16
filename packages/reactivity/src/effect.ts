type KeyToDepMap = Map<any, ReactiveEffect>
const targetMap = new WeakMap<any, KeyToDepMap>()

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}
  run() {
    activeEffect = this
    return this.fn()
  }
}
/**
 * 收集依赖
 * @param target
 * @param key
 */
export function track(target: object, key: unknown) {
  console.log('依赖收集')
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  depsMap.set(key, activeEffect)
  console.log('targetMap: ', targetMap)
}

/**
 * 触发依赖
 * @param target
 * @param key
 * @param newValue
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  console.log('依赖触发')
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effect = depsMap.get(key) as ReactiveEffect
  if (!effect) return
  effect.fn()
}
