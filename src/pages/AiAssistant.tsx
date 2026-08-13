import { useEffect, useRef, useState } from 'react'
import { Input, Button, Spin, Empty } from 'antd'
import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { askAssistant } from '../api/deepseek'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  source?: string
}

function inferSource(q: string): string {
  if (/液压/.test(q)) return '维修手册 P28-29'
  if (/发动机|机油/.test(q)) return '保养手册 P12'
  if (/保养|维护/.test(q)) return '保养手册 P28'
  return '操作手册 P8'
}

export default function AiAssistant() {
  const location = useLocation()
  const initial = (location.state as { question?: string } | null)?.question
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
      const answer = await askAssistant(q)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, source: inferSource(q) }])
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
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      <div className="page-subtitle">基于竞品手册知识库的技术问题智能问答</div>

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {messages.length === 0 && (
          <Empty
            description="向 AI 工程助手提问，例如：EX2600-7E 液压系统采用什么控制方式？"
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
                maxWidth: '78%',
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
                  background: m.role === 'user' ? '#2f81f7' : '#1a2a3f',
                  color: m.role === 'user' ? '#fff' : '#4c9bff',
                }}
              >
                {m.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              </div>
              <div
                style={{
                  background: m.role === 'user' ? '#152238' : '#101827',
                  border: '1px solid #1f2a40',
                  borderRadius: 10,
                  padding: '12px 16px',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', color: '#e7eef7', lineHeight: 1.9 }}>{m.content}</div>
                {m.source && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#22d3ee' }}>来源：{m.source}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ marginBottom: 16 }}>
            <Spin size="small" /> <span style={{ color: '#8b98ab', marginLeft: 8 }}>AI 正在分析…</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, paddingTop: 12 }}>
        <Input
          size="large"
          placeholder='输入技术问题，例如："EX2600-7E 液压系统采用什么控制方式？"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => send(input)}
        />
        <Button type="primary" size="large" icon={<SendOutlined />} onClick={() => send(input)} loading={loading}>
          发送
        </Button>
      </div>
    </div>
  )
}
