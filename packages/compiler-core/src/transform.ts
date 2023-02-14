import { NodeTypes } from './ast'
import { isSingleElementRoot } from './hoistStatic'

export function transform(root, options) {
  // 创建 transform 上下文
  const context = createTranformContext(root, options)

  // 深度优先，处理 node 节点转化
  traverseNode(root, context)

  createRootCodegen(root)
  root.helpers = [...context.helpers.keys()]
  root.components = []
  root.directives = []
  root.imports = []
  root.hoists = []
  root.temps = []
  root.cached = []
}

export interface TransformContext {
  root // ast 根节点
  parent: ParentNode | null // 每次转化时记录的父节点
  childIndex: number // 每次转化时记录的子节点索引
  currentNode // 当前处理的节点
  helpers: Map<symbol, number> // key 值为 Symbol(方法名)，表示 render 函数中创建节点的方法
  helper<T extends symbol>(name: T): T
  nodeTransforms: any[] // 转化方法集合
}

// 创建 transform 上下文
export function createTranformContext(
  root,
  { nodeTransforms = [] }
): TransformContext {
  const context: TransformContext = {
    root,
    parent: null,
    childIndex: 0,
    currentNode: root,
    helpers: new Map(),
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    nodeTransforms
  }

  return context
}

/**
 * 遍历转化节点，转化的过程一定要是深度优先的（即：孙 -> 子 -> 父），因为当前节点的状态往往需要根据子节点的情况来确定。
 * 转化的过程分为两个阶段：
 * 1. 进入阶段：存储所有节点的转化函数到 exitFns 中
 * 2. 退出阶段：执行 exitFns 中缓存的转化函数，且一定是倒叙的。因为只有这样才能保证整个处理过程是深度优先的
 */
export function traverseNode(node, context) {
  // 记录当前正处理的 node 节点
  context.currentNode = node
  // 获取当前节点的 transform 方法
  const { nodeTransforms } = context
  // 存储转化数组
  const exitFn: any = []
  // 循环获取节点的 transform 方法，放入缓存中
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      exitFn.push(onExit)
    }
  }

  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context)

      break
  }

  // 退出时执行 transform
  context.currentNode = node
  let i = exitFn.length
  while (i--) {
    exitFn[i]()
  }
}

export function traverseChildren(parent, context) {
  parent.children.forEach((node, index) => {
    context.parent = parent
    context.childIndex = index
    traverseNode(node, context)
  })
}

function createRootCodegen(root) {
  const { children } = root
  // 处理一个根节点的情况
  if (children.length === 1) {
    const child = children[0]
    if (isSingleElementRoot(root, child) && child.codegenNode) {
      const codegenNode = child.codegenNode
      root.codegenNode = codegenNode
    }
  }
}
