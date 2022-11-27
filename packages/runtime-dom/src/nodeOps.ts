const doc = document

export const nodeOps = {
  /**
   * 插入元素到指定位置
   */
  insert(el, parent, anchor) {
    parent.insertBefore(el, anchor || null)
  },
  /**
   * 创建指定元素
   */
  createElement(tag) {
    const el = doc.createElement(tag)
    return el
  },
  /**
   * 为元素设置 text
   */
  setElementText(el, text) {
    el.textContent = text
  },
  /**
   * 移除 dom
   */
  remove(el: Element) {
    const parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  },
  /**
   * 创建 Text 节点
   */
  createText(text: string) {
    const node = doc.createTextNode(text)
    return node
  },
  /**
   * 设置 Text 节点
   */
  setText(node, text) {
    node.nodeValue = text
  }
}
