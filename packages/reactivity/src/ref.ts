import { hasChange } from '@vue/shared'
import { createDep, Dep } from './dep'
import { activeEffect, trackEffect, triggerEffects } from './effect'
import { toReactive } from './reactive'

export interface Ref<T = any> {
  value: T
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, isShallow: boolean) {
  // 如果是 ref，则直接返回
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, isShallow)
}

class RefImpl<T> {
  private _value: T

  private _rawValue: T

  public dep?: Dep

  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = value
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChange(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

/**
 * 收集依赖
 */
export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(ref.dep || (ref.dep = createDep()))
  }
}

/**
 * 触发依赖
 */
export function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

/**
 * 是否为 ref
 */
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}
