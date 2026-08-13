import { useState } from 'react'
import { Select, Button, Descriptions, Spin, message } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import { hitachiProfile } from '../data/mock'
import { generateKeywords } from '../api/deepseek'

export default function AiAnalysis() {
  const [model, setModel] = useState('日立 EX2600-7E')
  const [keywords, setKeywords] = useState<string[]>(hitachiProfile.keywords)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const kws = await generateKeywords()
      if (kws.length) {
        setKeywords(kws)
        setGenerated(true)
        message.success('AI 分析完成')
      }
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="page-subtitle">选择竞品型号，生成产品基础档案</div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <Select
          style={{ width: 240 }}
          value={model}
          onChange={setModel}
          options={[{ value: '日立 EX2600-7E', label: '日立 EX2600-7E' }]}
        />
        <Button type="primary" icon={<ThunderboltOutlined />} onClick={run} loading={loading}>
          生成分析
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard title="产品基本信息">
          <Descriptions column={1} colon size="middle">
            <Descriptions.Item label="产品型号">{hitachiProfile.model}</Descriptions.Item>
            <Descriptions.Item label="品牌">{hitachiProfile.brand}</Descriptions.Item>
            <Descriptions.Item label="设备类型">{hitachiProfile.type}</Descriptions.Item>
            <Descriptions.Item label="吨位">
              <span className="stat-value" style={{ fontSize: 20 }}>
                {hitachiProfile.tonnage}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </SectionCard>

        <SectionCard title="技术关键词" accent>
          <Spin spinning={loading}>
            {keywords.map((k) => (
              <span key={k} className="keyword-tag">
                {k}
              </span>
            ))}
            {generated && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#7a8ba3' }}>
                由 DeepSeek 大模型实时生成
              </div>
            )}
          </Spin>
        </SectionCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <SectionCard title="竞品技术档案">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { k: '资料数量', v: '3 本手册' },
              { k: '已解析章节', v: '12 章' },
              { k: '提取参数', v: '86 项' },
            ].map((s) => (
              <div key={s.k}>
                <div className="stat-value">{s.v}</div>
                <div className="stat-label">{s.k}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
