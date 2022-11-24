import { extend } from '@vue/shared'
import { nodeOps } from 'packages/compiler-dom/src/nodeOps'
import { patchProp } from 'packages/compiler-dom/src/patchProp'
import { createRenderer } from 'packages/runtime-core/src/renderer'

const renderOptions = extend({ patchProp }, nodeOps)
let renderer

function ensureRenderer() {
  return renderer || (renderer = createRenderer(renderOptions))
}
export const render = (...args) => {
  ensureRenderer().render(...args)
}
