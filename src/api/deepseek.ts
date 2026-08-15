// DeepSeek 大模型客户端
// 密钥只存在于服务端（Vercel 反代），浏览器零 key。
// 知识（entries）来自上传资料，存于浏览器 localStorage；检索在本地，生成走后端。

import type { CompetitorProfile, KnowledgeEntry } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined
const MODEL = 'deepseek-chat'

// 系统角色 Prompt
export const SYSTEM_PROMPT = `你是一名具有20年经验的矿用液压挖掘机产品总体工程师，服务于「矿擎智鉴」——AI驱动的超大型矿山装备竞品技术洞察与产品决策平台。
你的任务不是简单回答问题，而是主动帮助产品总体工程师理解竞品技术、形成技术洞察、辅助产品开发决策。
分析重点：1.竞品方案 2.技术特点 3.工程评价 4.产品开发启示 5.信息来源。
回答要求：专业、工程化、给出依据、标注来源页码。`

async function chat(userContent: string, system: string = SYSTEM_PROMPT): Promise<string> {
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: userContent },
  ]
  if (!API_BASE) throw new Error('未配置反代地址 VITE_API_BASE')
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 1200 }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`请求失败（${res.status}）：${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return data?.content ?? data?.choices?.[0]?.message?.content ?? ''
}

// ── 上传资料 → AI 分析 → 建立知识（调用后端 /api/analyze）────────────
export interface AnalyzeResult {
  fileName: string
  profile: CompetitorProfile
  entries: KnowledgeEntry[]
}

export async function analyzeDocument(file: File): Promise<AnalyzeResult> {
  if (!API_BASE) throw new Error('未配置反代地址 VITE_API_BASE')
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/analyze`, { method: 'POST', body: fd })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI 分析失败（${res.status}）：${text.slice(0, 200)}`)
  }
  return (await res.json()) as AnalyzeResult
}

// ── 本地检索（兜底：系统名 + 关键词 + 全文 n-gram 重叠打分）────────────
const STOP_GRAMS = new Set([
  '是多少', '是什么', '怎么样', '如何', '多少', '什么', '怎么',
  '采用', '系统', '的', '吗', '呢', '请', '问', '一下', '了', '还是',
])

function charNgrams(s: string): Set<string> {
  const c = s.toLowerCase().replace(/[^一-龥a-z0-9]/g, '')
  const set = new Set<string>()
  if (!c) return set
  if (c.length <= 5) set.add(c)
  for (let n = 2; n <= 4; n++) {
    for (let i = 0; i + n <= c.length; i++) set.add(c.slice(i, i + n))
  }
  return set
}

export function retrieveLocal(entries: KnowledgeEntry[], question: string): KnowledgeEntry | null {
  const q = question.toLowerCase()
  const qGrams = charNgrams(question)
  let best: KnowledgeEntry | null = null
  let bestScore = 0
  for (const e of entries) {
    let score = 0
    if (e.system && question.includes(e.system)) score += 6
    for (const kw of e.zh_keywords || []) if (kw && question.includes(kw)) score += 3
    for (const tag of e.technical_tags || []) if (tag && q.includes(tag.toLowerCase())) score += 2
    // 全文 n-gram 重叠：覆盖同义/换词的情况（过滤常见提问停用片段）
    const hay = [e.original_text, e.translation, e.engineering_analysis].join(' ').toLowerCase()
    for (const g of qGrams) if (!STOP_GRAMS.has(g) && hay.includes(g)) score += 1
    if (score > bestScore) {
      bestScore = score
      best = e
    }
  }
  return bestScore > 0 ? best : null
}

// ── 可追溯回答（本地检索 + 后端 /api/ask 生成）────────────────────────
export interface RagAnswer {
  source: string
  page: string
  system: string
  original: string
  translation: string
  analysis: string
  advice: string
  matched_tags: string[]
}

async function generalAnswer(question: string): Promise<string> {
  try {
    return await chat(
      `请基于工程经验回答以下问题（知识库中未检索到直接相关条目）：${question}\n\n请先说明该回答无原文追溯、仅供参考，再给出专业回答。`,
    )
  } catch {
    return '知识库中暂未收录与该问题相关的条目，无法提供基于原文追溯的答案。建议补充相关资料或换个问法。'
  }
}

export async function askRag(question: string, entries: KnowledgeEntry[]): Promise<RagAnswer> {
  const noMatch = async (): Promise<RagAnswer> => ({
    source: '知识库未命中',
    page: '—',
    system: '—',
    original: '（知识库中未检索到与本问题直接相关的原文条目，以下为基于工程经验的通用回答，无原文追溯。）',
    translation: '',
    analysis: await generalAnswer(question),
    advice: '',
    matched_tags: [],
  })

  // 优先：把全部条目交给后端，由 DeepSeek 语义选择最相关条目并生成（避免答非所问）
  if (API_BASE && entries.length > 0) {
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          entries: entries.map((e) => ({
            id: e.id,
            system: e.system,
            source: e.source,
            page: e.page,
            original_text: e.original_text,
            translation: e.translation,
            engineering_analysis: e.engineering_analysis,
          })),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const idx = data.entry_index
        const e = typeof idx === 'number' && idx >= 0 && idx < entries.length ? entries[idx] : null
        if (e) {
          return {
            source: e.source,
            page: e.page,
            system: e.system,
            original: e.original_text,
            translation: data.translation || e.translation,
            analysis: data.analysis || e.engineering_analysis,
            advice: data.advice || e.development_advice,
            matched_tags: e.technical_tags || [],
          }
        }
        return noMatch()
      }
    } catch {
      // 后端异常 → 走本地兜底
    }
  }

  // 本地兜底：检索条目并直接用条目内已有的翻译/分析/启示
  const entry = retrieveLocal(entries, question)
  if (entry) {
    return {
      source: entry.source,
      page: entry.page,
      system: entry.system,
      original: entry.original_text,
      translation: entry.translation,
      analysis: entry.engineering_analysis,
      advice: entry.development_advice,
      matched_tags: entry.technical_tags || [],
    }
  }
  return noMatch()
}

// ── 报告组装（客户端基于知识条目）──────────────────────────────────────
export interface ReportSection {
  title: string
  paras: string[]
}
export interface ReportData {
  title: string
  product: string
  sections: ReportSection[]
}

export function buildReport(profile: CompetitorProfile | null, entries: KnowledgeEntry[]): ReportData {
  const product = profile?.model ? `${profile.brand} ${profile.model}`.trim() : '竞品对象'
  const systems = [...new Set(entries.map((e) => e.system).filter(Boolean))]
  const of = (name: string) => entries.filter((e) => e.system === name)

  const sections: ReportSection[] = [
    {
      title: '一、产品定位',
      paras: [
        profile
          ? `${product}，${profile.tonnage || ''}${profile.type || ''}；技术关键词：${(profile.keywords || []).join('、') || '—'}`
          : '（尚未解析出竞品画像，请先在资料库完成 AI 分析）',
        '本报告由上传竞品资料经 AI 分析生成，供产品开发决策参考。',
      ],
    },
    {
      title: '二、知识概况',
      paras: [`共抽取 ${entries.length} 条技术切片，覆盖 ${systems.join('、') || '—'} 等系统。`],
    },
  ]

  for (const sys of systems) {
    const list = of(sys)
    if (!list.length) continue
    sections.push({
      title: `${sys}分析`,
      paras: list.map((e) => `${e.translation || e.original_text} —— ${e.engineering_analysis}`),
    })
  }

  const advice = entries.map((e) => e.development_advice).filter(Boolean)
  if (advice.length) sections.push({ title: '产品开发建议', paras: advice })

  return { title: `${product} 竞品技术分析报告`, product, sections }
}

// ── 各功能页「点击生成」：基于知识上下文做针对性分析 ────────────────────
function knowledgeContext(profile: CompetitorProfile | null, entries: KnowledgeEntry[]): string {
  const head = profile
    ? `竞品画像：品牌 ${profile.brand}、型号 ${profile.model}、类型 ${profile.type}、吨位 ${profile.tonnage}；关键词：${(profile.keywords || []).join('、')}`
    : '（尚未解析出竞品画像）'
  const body = entries
    .map((e) => `【${e.system}·${e.source} P${e.page}】${e.translation || e.original_text}（分析：${e.engineering_analysis}）`)
    .join('\n')
  return `${head}\n\n知识条目：\n${body}`
}

// 1. 技术关键词
export async function generateKeywords(profile: CompetitorProfile | null, entries: KnowledgeEntry[]): Promise<string[]> {
  const text = await chat(
    `请基于以下竞品知识，提炼 5 个核心技术关键词。只输出关键词，用顿号分隔，不要任何解释。\n\n${knowledgeContext(profile, entries)}`,
  )
  return text
    .split(/[，,、；;\n]/)
    .map((s) => s.replace(/^[\d\s.、-]+/, '').trim())
    .filter(Boolean)
    .slice(0, 6)
}

// 2. 竞品数字画像摘要
export async function generatePortraitSummary(profile: CompetitorProfile | null, entries: KnowledgeEntry[]): Promise<string> {
  return chat(
    `请用一段话（150字以内）概括该竞品的技术画像与工程定位。\n\n${knowledgeContext(profile, entries)}`,
  )
}

// 3. 液压系统技术评价
export async function analyzeHydraulic(
  profile: CompetitorProfile | null,
  entries: KnowledgeEntry[],
): Promise<{ advantages: string; improvements: string }> {
  const text = await chat(
    `请分析该竞品液压系统的技术特点。严格分两段输出，第一段标题「优势」，第二段标题「可改进方向」，每段 3 条以内要点。\n\n${knowledgeContext(profile, entries)}`,
  )
  return splitTwoSections(text)
}

// 4. 总体方案分析
export async function generateOverall(
  profile: CompetitorProfile | null,
  entries: KnowledgeEntry[],
): Promise<{ layout: string; design: string; implications: string }> {
  const text = await chat(
    `请分析该竞品的总体方案。严格分三段输出，标题依次为「总体布置」「设计特点」「产品开发启示」，每段 3 条以内要点。\n\n${knowledgeContext(profile, entries)}`,
  )
  const s = splitByHeadings(text, ['总体布置', '设计特点', '产品开发启示'])
  return {
    layout: s['总体布置'] ?? '',
    design: s['设计特点'] ?? '',
    implications: s['产品开发启示'] ?? '',
  }
}

// 5. 竞品对比 AI 评价（竞品 vs 我司 300 吨级）
export async function compareProducts(
  profile: CompetitorProfile | null,
  entries: KnowledgeEntry[],
): Promise<{ advantages: string; differences: string; suggestions: string }> {
  const text = await chat(
    `请对比该竞品与我司 300 吨级矿用液压挖掘机。严格分三段输出，标题依次为「优势」「差异」「开发建议」，每段简洁列要点。\n\n${knowledgeContext(profile, entries)}`,
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
  if (Object.keys(result).length === 0) result[headings[0]] = text.trim()
  return result
}
