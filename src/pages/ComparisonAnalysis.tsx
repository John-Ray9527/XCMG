import { useState } from 'react'
import { Button, Spin, Tag, message } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'
import { compareProducts } from '../api/deepseek'

export default function ComparisonAnalysis() {
  const { profile, entries } = useAnalysis()
  const [loading, setLoading] = useState(false)
  const [evalResult, setEvalResult] = useState<{
    advantages: string
    differences: string
    suggestions: string
  } | null>(null)

  const run = async () => {
    setLoading(true)
    try {
      setEvalResult(await compareProducts(profile, entries))
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const renderBlock = (title: string, color: string, text: string) => (
    <div>
      <Tag color={color}>{title}</Tag>
      <ul style={{ color: '#c9d4e3', lineHeight: 2, paddingLeft: 18 }}>
        {text
          .split('\n')
          .map((s) => s.replace(/^[-•*]\s*/, '').trim())
          .filter(Boolean)
          .map((s, i) => (
            <li key={i}>{s}</li>
          ))}
      </ul>
    </div>
  )

  return (
    <RequireKnowledge>
      <div className="fade-up">
        <div className="page-subtitle">
          竞品工程对标 · {profile ? `${profile.brand} ${profile.model}` : '竞品'} vs 我司 300 吨级产品
        </div>

        <SectionCard
          title="AI 对标评价"
          accent
          extra={
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={run} loading={loading}>
              AI 生成评价
            </Button>
          }
        >
          {!evalResult ? (
            <div style={{ color: '#5b6a80', fontSize: 13 }}>
              点击「AI 生成评价」，由大模型基于上传资料输出竞品优势、差异与我司开发建议。
            </div>
          ) : (
            <Spin spinning={loading}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {renderBlock('优势', 'success', evalResult.advantages)}
                {renderBlock('差异', 'processing', evalResult.differences)}
                {renderBlock('开发建议', 'warning', evalResult.suggestions)}
              </div>
            </Spin>
          )}
        </SectionCard>
      </div>
    </RequireKnowledge>
  )
}
