/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为对象
 */
export const isObject = (obj: unknown) => {
  return obj !== null && typeof obj === 'object'
}

export const hasChange = (newVal: any, oldVal: any): boolean => {
  return !Object.is(newVal, oldVal)
}
