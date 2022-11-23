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

/**
 * 对比两个数据是否发生改变
 */
export const hasChange = (newVal: any, oldVal: any): boolean => {
  return !Object.is(newVal, oldVal)
}

export const isFunction = (val: unknown): val is Function => {
  return typeof val === 'function'
}
export const isString = (val: unknown): val is string => {
  return typeof val === 'string'
}

export const extend = Object.assign

export const EMPTY_OBJ: { readonly [key: string]: any } = {}
