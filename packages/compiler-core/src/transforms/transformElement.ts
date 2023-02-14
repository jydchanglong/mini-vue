import { NodeTypes, createVNodeCall } from '../ast'

export const transformElement = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode!
    // 只处理 element 类型的节点
    if (node.type !== NodeTypes.ELEMENT) {
      return
    }

    const { tag } = node
    let vnodeTag = `"${tag}"`
    let vnodeProps = []
    let vnodeChildren = node.children

    node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren
    )
  }
}
