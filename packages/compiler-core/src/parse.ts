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
  console.log(children)
  return {}
}

function createParserContext(content: string): ParserContext {
  return {
    source: content
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

  let isSelfClosing = startsWith(context.source, '/>')
  advanceBy(context, isSelfClosing ? 2 : 1)

  let tagType = ElementTypes.ELEMENT

  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    props: []
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
