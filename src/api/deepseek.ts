// DeepSeek 大模型客户端（浏览器直调，OpenAI 兼容接口）

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
const ENDPOINT = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'

// 系统角色 Prompt（按 PRD 第六节）
export const SYSTEM_PROMPT = `你是一名具有20年经验的矿用液压挖掘机产品总体工程师。
你的任务是分析竞品技术资料，为300吨级液压挖掘机产品开发提供技术支持。
分析重点：1.产品总体方案 2.液压系统 3.动力系统 4.控制系统 5.保养维护策略 6.对产品开发的启示。
回答要求：专业、工程化、给出依据、标注来源页码。`

async function chat(userContent: string, system: string = SYSTEM_PROMPT): Promise<string> {
  if (!API_KEY) {
    throw new Error('未配置 DeepSeek API Key，请在 .env 中填写 VITE_DEEPSEEK_API_KEY')
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`DeepSeek 请求失败（${res.status}）：${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

// 1. AI 工程助手对话
export async function askAssistant(question: string): Promise<string> {
  return chat(question)
}

// 2. 生成产品技术关键词
export async function generateKeywords(): Promise<string[]> {
  const text = await chat(
    '请针对日立 EX2600-7E 300吨级矿用液压挖掘机，提炼 5 个核心技术关键词。只输出关键词，用顿号分隔，不要任何解释。',
  )
  return text
    .split(/[，,、；;\n]/)
    .map((s) => s.replace(/^[\d\s.、-]+/, '').trim())
    .filter(Boolean)
    .slice(0, 6)
}

// 3. 液压系统技术评价
export async function analyzeHydraulic(): Promise<{ advantages: string; improvements: string }> {
  const text = await chat(
    '请分析日立 EX2600-7E 300吨级液压挖掘机液压系统的技术特点。请严格分两段输出：第一段标题为「优势」，第二段标题为「可改进方向」，每段用 3 条以内要点，标注依据来源页码。',
  )
  return splitTwoSections(text)
}

// 4. 竞品对比 AI 评价
export async function compareProducts(): Promise<{ advantages: string; differences: string; suggestions: string }> {
  const text = await chat(
    '请对比日立 EX2600-7E 与徐工 300 吨级矿用液压挖掘机。请严格分三段输出，标题依次为「优势」「差异」「开发建议」，每段简洁列要点。',
  )
  const sections = splitByHeadings(text, ['优势', '差异', '开发建议'])
  return {
    advantages: sections.优势 ?? '',
    differences: sections.差异 ?? '',
    suggestions: sections.开发建议 ?? '',
  }
}

// 工具：按「优势 / 可改进方向」两段拆分
function splitTwoSections(text: string): { advantages: string; improvements: string } {
  const sections = splitByHeadings(text, ['优势', '可改进方向'])
  return { advantages: sections.优势 ?? '', improvements: sections.可改进方向 ?? '' }
}

// 工具：按标题拆分成多段
function splitByHeadings(text: string, headings: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = text.split('\n')
  let current = ''
  let buffer: string[] = []
  for (const line of lines) {
    const hit = headings.find((h) => line.replace(/[#*：:\s]/g, '').includes(h))
    if (hit) {
      if (current) result[current] = buffer.join('\n').trim()
      current = hit
      buffer = []
    } else {
      buffer.push(line)
    }
  }
  if (current) result[current] = buffer.join('\n').trim()
  // 兜底：没匹配到标题时，整体塞进第一个标题
  if (Object.keys(result).length === 0) result[headings[0]] = text.trim()
  return result
}
