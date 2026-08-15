import { useState } from 'react'
import { Button, Descriptions, Spin, message } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'
import { generateKeywords, generatePortraitSummary } from '../api/deepseek'

export default function AiAnalysis() {
  const { profile, entries } = useAnalysis()
  const [keywords, setKeywords] = useState<string[]>(profile?.keywords || [])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const [kws, sum] = await Promise.all([
        generateKeywords(profile, entries),
        generatePortraitSummary(profile, entries),
      ])
      if (kws.length) {
        setKeywords(kws)
        setGenerated(true)
      }
      setSummary(sum)
      message.success('AI 分析完成')
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireKnowledge>
      <div className="fade-up">
        <div className="page-subtitle">竞品数字画像 · AI 从上传资料中提取产品参数与工程洞察</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SectionCard title="产品基本信息">
            <Descriptions column={1} colon size="middle">
              <Descriptions.Item label="产品型号">{profile?.model || '—'}</Descriptions.Item>
              <Descriptions.Item label="品牌">{profile?.brand || '—'}</Descriptions.Item>
              <Descriptions.Item label="设备类型">{profile?.type || '—'}</Descriptions.Item>
              <Descriptions.Item label="吨位">
                <span className="stat-value" style={{ fontSize: 20 }}>{profile?.tonnage || '—'}</span>
              </Descriptions.Item>
            </Descriptions>
          </SectionCard>

          <SectionCard
            title="技术关键词"
            accent
            extra={
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={run} loading={loading}>
                生成分析
              </Button>
            }
          >
            <Spin spinning={loading}>
              {keywords.map((k) => (
                <span key={k} className="keyword-tag">{k}</span>
              ))}
              {generated && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#7a8ba3' }}>
                  由 DeepSeek 大模型基于上传资料实时生成
                </div>
              )}
            </Spin>
          </SectionCard>
        </div>

        <div style={{ marginTop: 16 }}>
          <SectionCard title="AI 技术总结" accent>
            {summary ? (
              <div style={{ fontSize: 14, lineHeight: 1.9, color: '#c9d4e3' }}>{summary}</div>
            ) : (
              <div style={{ color: '#5b6a80', fontSize: 13 }}>
                点击右上角「生成分析」，由大模型基于上传资料生成技术画像总结。
              </div>
            )}
          </SectionCard>
        </div>

        <div style={{ marginTop: 16 }}>
          <SectionCard title="竞品技术档案">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <div className="stat-value">{profile ? 1 : 0}</div>
                <div className="stat-label">资料文件</div>
              </div>
              <div>
                <div className="stat-value">{entries.length}</div>
                <div className="stat-label">知识切片</div>
              </div>
              <div>
                <div className="stat-value">{new Set(entries.map((e) => e.system)).size}</div>
                <div className="stat-label">覆盖系统</div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </RequireKnowledge>
  )
}
