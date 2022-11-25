import { isString } from '@vue/shared'

export function patchStyle(el, prevValue, nextValue) {
  const style = (el as HTMLElement).style
  const isCssString = isString(nextValue)
  if (nextValue && !isCssString) {
    for (const key in nextValue) {
      setStyle(style, key, nextValue[key])
    }

    if (prevValue && !isString(prevValue)) {
      for (const key in prevValue) {
        if (nextValue[key] == null) {
          setStyle(style, key, '')
        }
      }
    }
  }
}

function setStyle(
  style: CSSStyleDeclaration,
  key: string,
  value: string | string[]
) {
  style[key] = value
}
