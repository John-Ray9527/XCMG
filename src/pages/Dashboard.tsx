import { useState } from 'react'
import { Input, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '📚', title: '竞品资料库', desc: '管理竞品技术资料', path: '/resources' },
  { icon: '🏗', title: '总体方案分析', desc: '分析竞品设计方案', path: '/overall' },
  { icon: '⚙', title: '液压系统分析', desc: '解析液压系统特点', path: '/hydraulic' },
  { icon: '🔧', title: '保养策略分析', desc: '提取维护周期', path: '/maintenance' },
  { icon: '📊', title: '竞品对比', desc: '生成产品对标报告', path: '/comparison' },
  { icon: '🤖', title: 'AI工程助手', desc: '技术问题智能问答', path: '/assistant' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

  const startAnalysis = () => {
    const q = question.trim() || '分析日立 EX2600-7E 液压系统特点'
    navigate('/assistant', { state: { question: q } })
  }

  return (
    <div className="fade-up">
      <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>矿擎智鉴</h1>
        <p style={{ color: '#7a8ba3', fontSize: 15, margin: '8px 0 0' }}>
          AI赋能的矿挖竞品技术洞察与产品决策平台
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '24px auto 0' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: '#5b6a80' }} />}
            placeholder='请输入您的技术问题，例如："分析日立EX2600-7E液压系统特点"'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onPressEnter={startAnalysis}
          />
          <Button size="large" type="primary" onClick={startAnalysis} style={{ minWidth: 120 }}>
            开始分析
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          marginTop: 32,
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="tech-card"
            style={{ cursor: 'pointer', padding: '22px 20px' }}
            onClick={() => navigate(f.path)}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#35e0c8')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2836')}
          >
            <div style={{ fontSize: 30, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: '#7a8ba3' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
