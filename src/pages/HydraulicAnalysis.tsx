import { useState } from 'react'
import { Button, Spin, message, Tag, Empty } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'
import { analyzeHydraulic } from '../api/deepseek'

function renderLines(text: string) {
  return text
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .map((s, i) => <li key={i}>{s}</li>)
}

export default function HydraulicAnalysis() {
  const { profile, entries } = useAnalysis()
  const [evaluation, setEvaluation] = useState<{ advantages: string; improvements: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const hydraulicEntries = entries.filter((e) => e.system === '液压系统')

  const run = async () => {
    setLoading(true)
    try {
      setEvaluation(await analyzeHydraulic(profile, entries))
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireKnowledge>
      <div className="fade-up">
        <div className="page-subtitle">液压系统技术洞察 · 基于上传资料动态解析液压方案与控制策略</div>

        <SectionCard title="液压系统知识切片">
          {hydraulicEntries.length === 0 ? (
            <Empty description="上传资料中未解析到「液压系统」相关条目" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hydraulicEntries.map((e) => (
                <div key={e.id} style={{ border: '1px solid #1e2836', borderRadius: 8, padding: '10px 14px', background: '#0d1422' }}>
                  <div style={{ marginBottom: 6 }}>
                    <Tag color="cyan">{e.source} P{e.page}</Tag>
                  </div>
                  <div style={{ fontSize: 13, color: '#c9d4e3', lineHeight: 1.7 }}>{e.translation || e.original_text}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div style={{ marginTop: 16 }}>
          <SectionCard
            title="技术评价"
            accent
            extra={
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={run} loading={loading}>
                AI 生成评价
              </Button>
            }
          >
            {!evaluation ? (
              <div style={{ color: '#5b6a80', fontSize: 13 }}>
                点击「AI 生成评价」，由大模型基于上传资料生成液压系统优势与改进方向。
              </div>
            ) : (
              <Spin spinning={loading}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Tag color="success">优势</Tag>
                    <ul style={{ color: '#c9d4e3', lineHeight: 2, paddingLeft: 18 }}>{renderLines(evaluation.advantages)}</ul>
                  </div>
                  <div>
                    <Tag color="warning">可改进方向</Tag>
                    <ul style={{ color: '#c9d4e3', lineHeight: 2, paddingLeft: 18 }}>{renderLines(evaluation.improvements)}</ul>
                  </div>
                </div>
              </Spin>
            )}
          </SectionCard>
        </div>
      </div>
    </RequireKnowledge>
  )
}
