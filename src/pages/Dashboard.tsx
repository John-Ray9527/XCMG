import { useState } from 'react'
import { Input, Button, Tag, Steps } from 'antd'
import { SearchOutlined, CloudUploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAnalysis } from '../store/AnalysisContext'

const features = [
  { icon: '📚', title: '竞品数字档案', desc: '上传竞品资料，AI 解析建立知识库', path: '/resources' },
  { icon: '🏗', title: '总体方案分析', desc: '分析竞品总体布置、系统架构，输出开发启示', path: '/overall' },
  { icon: '⚙', title: '液压系统技术洞察', desc: '分析液压方案、控制策略及工程应用价值', path: '/hydraulic' },
  { icon: '🔧', title: '可靠性与维护策略', desc: '提取维护周期、可靠性设计及服务策略', path: '/maintenance' },
  { icon: '📊', title: '竞品对标与开发建议', desc: '竞品工程对标，输出产品开发建议', path: '/comparison' },
  { icon: '🤖', title: 'AI工程检索助手', desc: '知识库检索 + 原文追溯 + 专业翻译', path: '/assistant' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { documentUploaded, analysisCompleted, knowledgeReady, fileName, profile, entries } = useAnalysis()
  const [question, setQuestion] = useState('')
  const [lastQuestion] = useState(localStorage.getItem('kq_last_question') || '')
  const [lastReport] = useState(localStorage.getItem('kq_last_report') || '')

  const currentStep = knowledgeReady ? 3 : documentUploaded ? 1 : 0

  const startAnalysis = () => {
    const q = question.trim() || '请分析该竞品的技术特点'
    navigate('/assistant', { state: { question: q } })
  }

  return (
    <div className="fade-up">
      <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>矿擎智鉴</h1>
        <p style={{ color: '#7a8ba3', fontSize: 15, margin: '8px 0 0' }}>
          AI驱动的超大型矿山装备竞品技术洞察与产品决策平台
        </p>
      </div>

      {/* 分析管线状态（真实状态） */}
      <div className="tech-card" style={{ maxWidth: 960, margin: '20px auto 0', padding: '16px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span className="lamp" />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>分析管线状态</span>
        </div>

        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: '上传资料', description: documentUploaded ? fileName || '已上传' : '上传竞品 PDF/TXT/MD' },
            { title: 'AI 分析', description: analysisCompleted ? '已解析' : 'DeepSeek 解析并建立知识' },
            { title: '知识就绪', description: knowledgeReady ? `${entries.length} 条切片` : '等待分析完成' },
          ]}
        />

        {knowledgeReady && profile ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginTop: 16 }}>
            <div>
              <div className="stat-label">竞品对象</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{profile.brand} {profile.model}</div>
            </div>
            <div>
              <div className="stat-label">吨位 / 类型</div>
              <div style={{ color: '#e6edf5' }}>{profile.tonnage} · {profile.type}</div>
            </div>
            <div>
              <div className="stat-label">知识库状态</div>
              <Tag color="success" style={{ marginTop: 2 }}>已建立知识索引</Tag>
            </div>
            <div>
              <div className="stat-label">知识条目</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{entries.length}</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <CloudUploadOutlined style={{ fontSize: 26, color: '#f5a623' }} />
            <div style={{ flex: 1, color: '#7a8ba3', fontSize: 13 }}>
              尚未就绪——请先前往「竞品数字档案」上传竞品资料并完成 AI 分析，之后各功能页即可动态生成分析结果。
            </div>
            <Button type="primary" onClick={() => navigate('/resources')}>上传资料开始</Button>
          </div>
        )}
      </div>

      {/* 最近活动（真实状态：来自本地使用记录） */}
      <div className="tech-card" style={{ maxWidth: 960, margin: '16px auto 0', padding: '16px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="lamp" />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>最近活动</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div className="stat-label">最近分析问题</div>
            <div style={{ color: '#c9d4e3', fontSize: 13, lineHeight: 1.6 }}>
              {lastQuestion || '暂无 — 前往「AI 工程检索助手」提问'}
            </div>
          </div>
          <div>
            <div className="stat-label">最近生成报告</div>
            <div style={{ color: '#c9d4e3', fontSize: 13, lineHeight: 1.6 }}>
              {lastReport || '暂无 — 前往「报告生成中心」生成'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '24px auto 0' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            size="large"
            prefix={<SearchOutlined style={{ color: '#5b6a80' }} />}
            placeholder='请输入您的技术问题，例如："液压系统采用什么控制方式？"'
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
