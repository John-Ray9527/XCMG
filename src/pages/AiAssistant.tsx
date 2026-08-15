import { useEffect, useRef, useState } from 'react'
import { Input, Button, Spin, Empty, Tag } from 'antd'
import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { askRag } from '../api/deepseek'
import type { RagAnswer } from '../api/deepseek'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'

interface ChatMsg {
  role: 'user' | 'assistant'
  content?: string
  answer?: RagAnswer
}

// 将 DeepSeek 返回的 markdown 轻量排版（去 ** / 列表符 → 逐行渲染）
function renderLines(text: string) {
  return text
    .replace(/\*\*/g, '')
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .map((s, i) => (
      <div key={i} style={{ lineHeight: 1.8 }}>{s}</div>
    ))
}

function Section({ label, color, text }: { label: string; color: string; text: string }) {
  if (!text) return null
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color, marginBottom: 5, fontWeight: 600, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#c9d4e3' }}>{renderLines(text)}</div>
    </div>
  )
}

function RagAnswerView({ answer }: { answer: RagAnswer }) {
  const noMatch = answer.source === '知识库未命中'
  const hasPage = answer.page && answer.page !== '—'

  return (
    <div>
      {/* 资料来源 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#7a8ba3', marginRight: 6 }}>资料来源：</span>
        <Tag color={noMatch ? 'warning' : 'cyan'} style={{ marginRight: 6 }}>{answer.source}</Tag>
        {answer.system && answer.system !== '—' && <Tag style={{ marginRight: 6 }}>{answer.system}</Tag>}
        {hasPage && <Tag>P{answer.page}</Tag>}
      </div>

      {/* 原文 / 未命中提示 */}
      <div
        style={{
          background: '#0d1422',
          border: '1px solid #1e2836',
          borderLeft: `3px solid ${noMatch ? '#7a8ba3' : '#f5a623'}`,
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, color: noMatch ? '#7a8ba3' : '#f5a623', marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>
          {noMatch ? '提示' : '英文原文'}
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#c9d4e3',
            lineHeight: 1.7,
            fontFamily: noMatch ? 'inherit' : 'Consolas, "Courier New", monospace',
          }}
        >
          {answer.original}
        </div>
      </div>

      <Section label="专业翻译" color="#35e0c8" text={answer.translation} />
      <Section label="技术分析" color="#7a8ba3" text={answer.analysis} />
      <Section label="产品开发启示" color="#f5a623" text={answer.advice} />

      {answer.matched_tags.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <span style={{ fontSize: 12, color: '#5b6a80', marginRight: 6 }}>技术标签：</span>
          {answer.matched_tags.map((t) => (
            <Tag key={t} style={{ marginBottom: 4, fontSize: 12 }}>{t}</Tag>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AiAssistant() {
  const location = useLocation()
  const initial = (location.state as { question?: string } | null)?.question
  const { entries } = useAnalysis()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setInput('')
    setLoading(true)
    try {
      const answer = await askRag(q, entries)
      setMessages((prev) => [...prev, { role: 'assistant', answer }])
      localStorage.setItem('kq_last_question', q)
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `请求失败：${(e as Error).message}` }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initial) send(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  return (
    <RequireKnowledge>
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
        <div className="page-subtitle">知识库检索 + 原文追溯 + 专业翻译</div>

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {messages.length === 0 && (
          <Empty
            description="输入技术问题，例如：液压系统采用什么控制策略？"
            style={{ marginTop: 80 }}
          />
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className="fade-up"
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                maxWidth: '82%',
                display: 'flex',
                gap: 10,
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: m.role === 'user' ? '#35e0c8' : '#12262a',
                  color: m.role === 'user' ? '#fff' : '#35e0c8',
                }}
              >
                {m.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              </div>
              <div
                style={{
                  background: m.role === 'user' ? '#12262a' : '#101827',
                  border: '1px solid #1e2836',
                  borderRadius: 10,
                  padding: '12px 16px',
                }}
              >
                {m.answer ? (
                  <RagAnswerView answer={m.answer} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', color: '#e6edf5', lineHeight: 1.9 }}>{m.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ marginBottom: 16 }}>
            <Spin size="small" /> <span style={{ color: '#7a8ba3', marginLeft: 8 }}>正在检索知识库并生成分析…</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, paddingTop: 12 }}>
        <Input
          size="large"
          placeholder='请输入技术问题，例如："液压系统采用什么控制策略？"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => send(input)}
        />
        <Button type="primary" size="large" icon={<SendOutlined />} onClick={() => send(input)} loading={loading}>
          开始分析
        </Button>
        </div>
      </div>
    </RequireKnowledge>
  )
}
