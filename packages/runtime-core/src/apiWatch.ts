import { EMPTY_OBJ, hasChange, isObject } from '@vue/shared'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { isReactive } from 'packages/reactivity/src/reactive'
import { queuePreFlushCb } from './scheduler'

export interface WatchOptions<Immediate = boolean> {
  immediate?: Immediate
  deep?: boolean
}

export function watch(source, cb: Function, options?: WatchOptions) {
  return doWatch(source as any, cb, options)
}

function doWatch(
  source,
  cb: Function,
  { immediate, deep }: WatchOptions = EMPTY_OBJ
) {
  // 触发 getter 的指定函数
  let getter: () => any

  // 判断 source 的数据类型
  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {}
  }

  if (cb && deep) {
    const baseGetter = getter
    // 手动触发依赖收集
    getter = () => traverse(baseGetter())
  }

  // 旧值
  let oldVal = {}

  // job 方法
  const job = () => {
    if (cb) {
      const newVal = effect.run()
      if (deep || hasChange(newVal, oldVal)) {
        cb(newVal, oldVal)
        oldVal = newVal
      }
    }
  }

  // 调度器
  let scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldVal = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}

function traverse(value: unknown) {
  if (!isObject(value)) {
    return value
  }
  for (const key in value as object) {
    traverse((value as any)[key])
  }
  return value
}
