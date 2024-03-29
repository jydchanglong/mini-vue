import { NodeTypes, ElementTypes, TagType } from './ast'

export interface ParserContext {
  source: string
}

/**
 * 基础的 parse 方法，生成 AST
 * @param content tempalte 模板
 */
export function baseParse(content: string) {
  const context = createParserContext(content)
  const children = parseChildren(context, [])
  // console.log(children)
  return createRoot(children)
}

function createParserContext(content: string): ParserContext {
  return {
    source: content
  }
}

/**
 * 生成 root 节点
 */
export function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children,
    log: {}
  }
}

// 判断当前标签是否为：结束标签的开始
function startsWithEndTagOpen(source: string, tag: string) {
  return (
    startsWith(source, '</') &&
    source.slice(2, 2 + tag.length).toLocaleLowerCase() ===
      tag.toLocaleLowerCase() &&
    /[\t\r\n\f />]/.test(source[2 + tag.length] || '>')
  )
}

function parseChildren(context: ParserContext, ancestors) {
  // 存放所有节点数据
  const nodes = []

  while (!isEnd(context, ancestors)) {
    const s = context.source
    // node 节点
    let node
    if (startsWith(s, '{{')) {
      node = parseInterpolation(context)
    }
    // < 意味着一个标签的开始
    else if (s[0] === '<') {
      // 以 < 开始，后面跟a-z 表示，这是一个标签的开始
      if (/[a-z]/i.test(s[1])) {
        // 此时要处理 Element
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }
    pushNode(nodes, node)
  }

  return nodes
}

// 解析插值表达式 {{ abc }}
function parseInterpolation(context) {
  const [open, close] = ['{{', '}}']
  advanceBy(context, open.length)

  const closeIndex = context.source.indexOf(close, open.length)
  const preTrimContent = parseTextData(context, closeIndex)
  const content = preTrimContent.trim()

  advanceBy(context, close.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatict: false,
      content
    }
  }
}

function parseElement(context: ParserContext, ancestors) {
  // 处理开始标签
  const element = parseTag(context, TagType.Start)

  // 处理子节点
  ancestors.push(element)
  const children = parseChildren(context, ancestors)
  ancestors.pop()
  element.children = children

  // 处理结束标签
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  }

  return element
}

function startsWith(source: string, searchTxt: string): boolean {
  return source.startsWith(searchTxt)
}

function isEnd(source: ParserContext, ancestors): boolean {
  const s = source.source

  if (startsWith(s, '</')) {
    for (let i = ancestors.length - 1; i >= 0; --i) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }

  return !s
}

function pushNode(nodes, node) {
  nodes.push(node)
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source)
  const tag = match[1]

  advanceBy(context, match[0].length)

  advanceSpace(context)
  let props = parseAttributes(context, type)

  let isSelfClosing = startsWith(context.source, '/>')
  advanceBy(context, isSelfClosing ? 2 : 1)

  let tagType = ElementTypes.ELEMENT

  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    props
  }
}

function advanceSpace(context: ParserContext): void {
  const match = /^[\t\r\n\f ]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

/**
 * 解析属性与指令
 */
function parseAttributes(context, type) {
  const props: any = []
  // 属性名数组
  const attributeNames = new Set<string>()
  // 循环解析找到标签结束
  while (
    context.source.length > 0 &&
    !startsWith(context.source, '>') &&
    !startsWith(context.source, '/>')
  ) {
    // 具体某个属性的处理
    const attr = parseAttribute(context, attributeNames)
    if (type === TagType.Start) {
      props.push(attr)
    }
    advanceSpace(context)
  }
  return props
}

/**
 * 处理指定指令，返回指令节点
 */
function parseAttribute(context: ParserContext, nameSet: Set<string>) {
  // 获取属性名
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)!
  const name = match[0]
  nameSet.add(name)

  advanceBy(context, name.length)

  // 获取属性值
  let value: any = undefined

  if (/^[\t\r\n\f ]*=/.test(context.source)) {
    advanceSpace(context)
    advanceBy(context, 1)
    advanceSpace(context)
    value = parseAttributeValue(context)
  }

  // 专门处理 v- 的指令
  if (/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name)) {
    // 获取指令名称
    const match =
      /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(
        name
      )!
  }
}

function advanceBy(context: ParserContext, stepLength: number) {
  const s = context.source
  context.source = s.slice(stepLength)
}

function parseText(context: ParserContext) {
  const endTokens = ['<', '{{']

  let endIndex = context.source.length

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context: ParserContext, endIndex) {
  const rawText = context.source.slice(0, endIndex)
  advanceBy(context, rawText.length)
  return rawText
}
