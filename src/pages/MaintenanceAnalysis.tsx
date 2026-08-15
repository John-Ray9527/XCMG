import { useState } from 'react'
import { Table, Input, Button, Spin, Tag, message, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'
import { askRag } from '../api/deepseek'
import type { RagAnswer } from '../api/deepseek'

export default function MaintenanceAnalysis() {
  const { entries } = useAnalysis()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<RagAnswer | null>(null)

  const maintenanceEntries = entries.filter((e) => e.system === '维护保养')

  const columns = [
    { title: '系统', dataIndex: 'system', key: 'system', width: 110 },
    { title: '维护内容', dataIndex: 'item', key: 'item' },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 200,
      render: (v: string) => <span style={{ color: '#35e0c8' }}>{v}</span>,
    },
  ]

  const search = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer(null)
    try {
      setAnswer(await askRag(question, entries))
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireKnowledge>
      <div className="fade-up">
        <div className="page-subtitle">可靠性与维护策略分析 · 基于上传资料提取维护周期与可靠性设计</div>

        <SectionCard title="维护保养知识切片">
          {maintenanceEntries.length === 0 ? (
            <Empty description="上传资料中未解析到「维护保养」相关条目" />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={maintenanceEntries.map((e) => ({
                id: e.id,
                system: e.system,
                item: e.translation || e.original_text,
                source: `${e.source} P${e.page}`,
              }))}
              pagination={false}
              size="middle"
            />
          )}
        </SectionCard>

        <div style={{ marginTop: 16 }}>
          <SectionCard title="维护策略智能问答" accent>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: '#5b6a80' }} />}
                placeholder="例如：液压油多久更换？维护周期是多久？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onPressEnter={search}
              />
              <Button type="primary" size="large" onClick={search} loading={loading}>
                查询
              </Button>
            </div>

            {loading && <Spin />}
            {answer && (
              <div className="fade-up" style={{ background: '#0d1422', borderRadius: 8, padding: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <Tag color={answer.source === '知识库未命中' ? 'warning' : 'cyan'}>{answer.source}</Tag>
                  {answer.page !== '—' && <Tag>P{answer.page}</Tag>}
                </div>
                {answer.original && answer.source !== '知识库未命中' && (
                  <div style={{ fontSize: 12, color: '#f5a623', marginBottom: 8, fontFamily: 'Consolas, monospace' }}>
                    原文：{answer.original}
                  </div>
                )}
                {answer.translation && (
                  <div style={{ whiteSpace: 'pre-wrap', color: '#c9d4e3', lineHeight: 1.9, marginBottom: 8 }}>
                    翻译：{answer.translation}
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap', color: '#e6edf5', lineHeight: 1.9 }}>{answer.analysis}</div>
                {answer.advice && (
                  <div style={{ marginTop: 8, color: '#c9d4e3', lineHeight: 1.8 }}>开发启示：{answer.advice}</div>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </RequireKnowledge>
  )
}
