import { NodeTypes, createCompoundExpression } from '../ast'
import { isText } from '../utils'

/**
 * <div>hello {{ msg }}</div> 转化为：
 * children:[
 * 	{ TEXT 文本节点 },
 *  " + ",
 *  { INTERPOLATION 表达式节点 }
 * ]
 */
export const transformText = (node, context) => {
  if (
    node.type === NodeTypes.ROOT ||
    node.type === NodeTypes.ELEMENT ||
    node.type === NodeTypes.FOR ||
    node.type === NodeTypes.IF_BRANCH
  ) {
    return () => {
      const children = node.children
      // 当前容器
      let currentContainer
      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            let next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = createCompoundExpression(
                  [child],
                  child.loc
                )
              }
              currentContainer.children.push(' + ', next)
              children.splice(j, 1)
              j--
            }
          }
        } else {
          currentContainer = undefined
          break
        }
      }
    }
  }
}
