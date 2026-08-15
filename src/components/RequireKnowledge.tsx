import type { ReactNode } from 'react'
import { Button, Result } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAnalysis } from '../store/AnalysisContext'

// 门槛组件：知识未就绪时，拦截分析类页面并引导上传
export default function RequireKnowledge({ children }: { children: ReactNode }) {
  const { knowledgeReady } = useAnalysis()
  const navigate = useNavigate()

  if (knowledgeReady) return <>{children}</>

  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <Result
        icon={<CloudUploadOutlined style={{ color: '#35e0c8' }} />}
        title="请先上传资料并完成 AI 分析"
        subTitle="知识库尚未就绪。请前往「竞品数字档案」上传竞品资料，AI 分析后即可在各功能页动态生成分析结果。"
        extra={
          <Button type="primary" size="large" onClick={() => navigate('/resources')}>
            前往上传资料
          </Button>
        }
      />
    </div>
  )
}
