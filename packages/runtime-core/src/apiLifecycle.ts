import { LifecycleHooks } from './component'

export const createHook = (lifecycle: LifecycleHooks) => {
  return (hook, target) => injectHook(lifecycle, hook, target)
}

export function injectHook(type: LifecycleHooks, hook: Function, target) {
  if (target) {
    // 将 hook 注册到组件实例中
    target[type] = hook
    return hook
  }
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
