import { useState } from 'react'
import { Button, Upload, Steps, Tag, message, Spin, Empty, Alert } from 'antd'
import { UploadOutlined, ThunderboltOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import { useAnalysis } from '../store/AnalysisContext'
import { analyzeDocument } from '../api/deepseek'

export default function ResourceLibrary() {
  const {
    documentUploaded,
    knowledgeReady,
    fileName,
    profile,
    entries,
    uploadDocument,
    completeAnalysis,
    reset,
  } = useAnalysis()

  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const beforeUpload = (f: File) => {
    if (f.size > 4 * 1024 * 1024) {
      message.warning('文件需小于 4MB')
      return false
    }
    setFile(f)
    uploadDocument(f.name)
    message.success(`已选择 ${f.name}`)
    return false // 阻止自动上传，等待手动触发「AI 分析」
  }

  const startAnalyze = async () => {
    if (!file) {
      message.warning('请先上传竞品资料（PDF / TXT / MD）')
      return
    }
    setAnalyzing(true)
    try {
      const result = await analyzeDocument(file)
      completeAnalysis(result.profile, result.entries)
      message.success(`AI 分析完成：抽取 ${result.entries.length} 条知识切片`)
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  const currentStep = knowledgeReady ? 3 : documentUploaded ? 1 : 0

  return (
    <div className="fade-up">
      <div className="page-subtitle">上传竞品资料 → AI 分析 → 建立知识，作为各功能页动态分析的数据来源</div>

      <SectionCard title="分析管线">
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: '上传资料', description: documentUploaded ? fileName || '已上传' : '选择 PDF / TXT / MD' },
            { title: 'AI 分析', description: analyzing ? '正在抽取文本并建立知识…' : 'DeepSeek 解析资料内容' },
            { title: '知识就绪', description: knowledgeReady ? '可前往各功能页动态生成' : '等待分析完成' },
          ]}
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <Upload showUploadList={false} beforeUpload={beforeUpload} accept=".pdf,.txt,.md">
            <Button icon={<UploadOutlined />} disabled={analyzing}>
              上传竞品资料
            </Button>
          </Upload>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={startAnalyze}
            loading={analyzing}
            disabled={!file}
          >
            开始 AI 分析
          </Button>
          {(documentUploaded || knowledgeReady) && (
            <Button icon={<ReloadOutlined />} onClick={reset}>
              清空重新开始
            </Button>
          )}
        </div>

        {analyzing && (
          <div style={{ marginTop: 16 }}>
            <Spin /> <span style={{ color: '#7a8ba3', marginLeft: 8 }}>正在读取资料并生成知识条目（约 10–30 秒）…</span>
          </div>
        )}
      </SectionCard>

      {knowledgeReady ? (
        <div style={{ marginTop: 16 }}>
          <SectionCard title="已建立的知识库" accent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div>
                <div className="stat-label">竞品对象</div>
                <div className="stat-value">{profile ? `${profile.brand} ${profile.model}` : fileName}</div>
              </div>
              <div>
                <div className="stat-label">吨位 / 类型</div>
                <div style={{ color: '#e6edf5' }}>{profile ? `${profile.tonnage} · ${profile.type}` : '—'}</div>
              </div>
              <div>
                <div className="stat-label">知识条目</div>
                <div className="stat-value">{entries.length} 条</div>
              </div>
            </div>

            <div className="stat-label" style={{ marginBottom: 8 }}>覆盖系统</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[...new Set(entries.map((e) => e.system))].map((s) => (
                <Tag key={s} color="cyan">{s}</Tag>
              ))}
            </div>

            <div className="stat-label" style={{ margin: '16px 0 8px' }}>技术关键词</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(profile?.keywords || []).map((k) => (
                <span key={k} className="keyword-tag">{k}</span>
              ))}
            </div>

            {entries.length === 0 && (
              <Alert style={{ marginTop: 16 }} type="warning" showIcon message="未能从资料中提取到有效知识条目，请换一份内容更完整的资料重试。" />
            )}
          </SectionCard>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <SectionCard title="资料文件">
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                <FilePdfOutlined style={{ fontSize: 28, color: '#35e0c8' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: '#7a8ba3' }}>{(file.size / 1024).toFixed(1)} KB · 待 AI 分析</div>
                </div>
              </div>
            ) : (
              <Empty description="尚未上传资料" />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
