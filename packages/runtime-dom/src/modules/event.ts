export function patchEvent(
  el: Element & { _vei?: object },
  rawName: string,
  prevValue,
  nextValue
) {
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[rawName]

  if (nextValue && existingInvoker) {
    // 如果存在 nextValue 和 existingInvoker，则是更新
    existingInvoker.value = nextValue
  } else {
    const name = parseName(rawName)
    if (nextValue) {
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } else if (existingInvoker) {
      el.removeEventListener(name, existingInvoker)
      invokers[rawName] = undefined
    }
  }
}

function parseName(name: string) {
  return name.slice(2).toLocaleLowerCase()
}

function createInvoker(initialValue) {
  const invoker = () => {
    invoker.value && invoker.value()
  }

  invoker.value = initialValue

  return invoker
}
