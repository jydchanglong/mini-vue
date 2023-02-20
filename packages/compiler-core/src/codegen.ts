import { isString, isArray } from '@vue/shared'
import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING, helperNameMap } from './runtimeHelpers'
import { getVNodeHelper } from './utils'

export function generate(ast) {
  // 生成上下文
  const context = createCodegenContext(ast)
  // 获取拼接方法
  const { push, newline, indent, deindent } = context

  // 生成函数前置代码
  genFuntionPreamble(context)

  // 创建方法名称
  const functionName = 'render'
  // 创建方法参数
  const args = ['_ctx', '_cache']
  const signature = args.join(',')

  push(`function ${functionName}(${signature}) {`)

  indent()

  push(`with (_ctx) {`)
  indent()

  const hasHelpers = ast.helpers.length > 0
  if (hasHelpers) {
    push(`const {${ast.helpers.map(aliasHelper).join(', ')}} = _Vue`)
    push('\n')
    newline()
  }
  newline()
  push(`return `)

  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }
  deindent()
  push(`}`)

  // with 结尾
  deindent()
  push('}')

  return {
    ast,
    code: context.code
  }
}

function createCodegenContext(ast) {
  const context = {
    code: ``, // render 函数代码字符串
    runtimeGlobalName: 'Vue',
    source: ast.loc?.source,
    indentLevel: 0, // 缩进级别
    helper(key) {
      return `_${helperNameMap[key]}`
    },
    push(code) {
      context.code += code
    },
    newline() {
      newline(context.indentLevel)
    },
    indent() {
      newline(++context.indentLevel)
    },
    deindent() {
      newline(--context.indentLevel)
    }
  }

  function newline(n: number) {
    context.code += '\n' + ' '.repeat(n)
  }

  return context
}

function genFuntionPreamble(context) {
  const { push, newline, runtimeGlobalName } = context
  const VueBinding = runtimeGlobalName
  push(`const _Vue = ${VueBinding}\n`)
  newline()
  push(`return `)
}

const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context)
      break
    case NodeTypes.TEXT:
      genText(node, context)
      break
    // 复合表达式
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    // 表达式
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
  }
}

function genCompoundExpression(node, context) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (isString(child)) {
      context.push(child)
    } else {
      genNode(child, context)
    }
  }
}

function genExpression(node, context) {
  const { content, isStatic } = node
  context.push(isStatic ? JSON.stringify(content) : content)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

// 处理 TEXT 节点
function genText(node, context) {
  context.push(JSON.stringify(node.content), node)
}

// 处理 VNODE_CALL 节点
function genVNodeCall(node, context) {
  const { push, helper } = context
  const { tag, props, children, patchFlag, dynamicProps, isComponent } = node
  const callHelper = getVNodeHelper(context.inSSR, isComponent)
  push(helper(callHelper) + '(', node)

  // 获取函数参数
  const args = genNullableArgs([tag, props, children, patchFlag, dynamicProps])
  // 函数参数填充
  genNodeList(args, context)

  push(')')
}

function genNullableArgs(args: any[]) {
  let i = args.length
  while (i--) {
    if (args[i] != null) break
  }
  return args.slice(0, i + 1).map(arg => arg || `null`)
}

function genNodeList(nodes, context) {
  const { push, newline } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else if (isArray(node)) {
      genNodeListAsArray(node, context)
    } else {
      // 对象类型的，递归处理
      genNode(node, context)
    }

    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNodeListAsArray(nodes, context) {
  context.push('[')
  genNodeList(nodes, context)
  context.push(']')
}
