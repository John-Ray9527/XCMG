import { useState } from 'react'
import { Button, Spin, message } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'
import { generateOverall } from '../api/deepseek'

function renderLines(text: string) {
  return text
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .map((s, i) => <li key={i}>{s}</li>)
}

export default function OverallAnalysis() {
  const { profile, entries } = useAnalysis()
  const [result, setResult] = useState<{ layout: string; design: string; implications: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      setResult(await generateOverall(profile, entries))
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireKnowledge>
      <div className="fade-up">
        <div className="page-subtitle">总体方案分析 · 基于上传资料动态生成总体布置与产品开发启示</div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#7a8ba3', fontSize: 13 }}>
            分析对象：{profile ? `${profile.brand} ${profile.model}` : '—'}
          </span>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={run} loading={loading}>
            生成分析
          </Button>
        </div>

        {!result ? (
          <SectionCard title="总体方案分析">
            <div style={{ color: '#5b6a80', fontSize: 13 }}>
              点击「生成分析」，由大模型基于上传资料输出总体方案洞察。
            </div>
          </SectionCard>
        ) : (
          <Spin spinning={loading}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { title: '总体布置', value: result.layout },
                { title: '设计特点', value: result.design },
                { title: '产品开发启示', value: result.implications },
              ].map((g) => (
                <SectionCard key={g.title} title={g.title} accent>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#c9d4e3', lineHeight: 2 }}>
                    {renderLines(g.value)}
                  </ul>
                </SectionCard>
              ))}
            </div>
          </Spin>
        )}
      </div>
    </RequireKnowledge>
  )
}
