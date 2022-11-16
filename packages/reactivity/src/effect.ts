import { isArray } from '@vue/shared'
import { createDep, Dep } from './dep'

type KeyToDepMap = Map<any, Dep>
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
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffect(dep)
  console.log('targetMap: ', targetMap)
}

export function trackEffect(dep: Dep) {
  dep.add(activeEffect!)
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
  const dep: Dep | undefined = depsMap.get(key)
  if (!dep) return
  triggerEffects(dep)
}

/**
 * 依次触发 deps 中的依赖
 * @param deps
 */
export function triggerEffects(deps: Dep) {
  const effects = isArray(deps) ? deps : [...deps]
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 * 触发指定依赖
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}
