import { compile } from '@vue/compiler-dom'
import { registerRuntimeCompiler } from 'packages/runtime-core/src/component'

function compileToFunction(tempalte, options?) {
  const { code } = compile(tempalte, options)
  const render = new Function(code)()

  return render
}

export { compileToFunction as compile }

// 注册 compiler
registerRuntimeCompiler(compileToFunction)
