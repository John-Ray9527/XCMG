import { useState } from 'react'
import { Table, Input, Button, Spin, Tag, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import { hitachiProfile, maintenanceReference } from '../data/mock'
import { askAssistant } from '../api/deepseek'

export default function MaintenanceAnalysis() {
  const [question, setQuestion] = useState('液压油多久更换？')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [source, setSource] = useState('')

  const columns = [
    { title: '系统', dataIndex: 'system', key: 'system', width: 120 },
    { title: '维护项目', dataIndex: 'item', key: 'item' },
    { title: '周期', dataIndex: 'interval', key: 'interval', width: 120, render: (v: string) => <Tag color="processing">{v}</Tag> },
    { title: '来源', dataIndex: 'source', key: 'source', width: 160, render: (v: string) => <span style={{ color: '#35e0c8' }}>{v}</span> },
  ]

  const search = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const text = await askAssistant(question)
      setAnswer(text)
      // 根据问题关键词推断来源
      if (/液压/.test(question)) setSource(maintenanceReference.hydraulic)
      else if (/发动机|机油/.test(question)) setSource(maintenanceReference.engine)
      else setSource(maintenanceReference.general)
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="page-subtitle">自动提取竞品维护策略与保养周期</div>

      <SectionCard title="保养周期表">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={hitachiProfile.maintenance}
          pagination={false}
          size="middle"
        />
      </SectionCard>

      <div style={{ marginTop: 16 }}>
        <SectionCard title="维护策略智能问答" accent>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Input
              size="large"
              prefix={<SearchOutlined style={{ color: '#5b6a80' }} />}
              placeholder="例如：液压油多久更换？"
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
              <div style={{ whiteSpace: 'pre-wrap', color: '#e6edf5', lineHeight: 1.9 }}>{answer}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#35e0c8' }}>来源：{source}</div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
