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
  }
}
