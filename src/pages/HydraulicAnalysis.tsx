import { useState } from 'react'
import { Button, Spin, message, Tag } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import SectionCard from '../components/SectionCard'
import FlowDiagram from '../components/FlowDiagram'
import { hitachiProfile } from '../data/mock'
import { analyzeHydraulic } from '../api/deepseek'

const radarOption = {
  tooltip: {},
  radar: {
    indicator: [
      { name: '功率匹配', max: 100 },
      { name: '负载控制', max: 100 },
      { name: '节能', max: 100 },
      { name: '可靠性', max: 100 },
      { name: '维护性', max: 100 },
    ],
    axisName: { color: '#7a8ba3' },
    splitLine: { lineStyle: { color: '#1e2836' } },
    splitArea: { areaStyle: { color: ['#0d1422', '#111a2b'] } },
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [90, 88, 82, 92, 85],
          name: 'EX2600-7E',
          areaStyle: { color: 'rgba(53,224,200,0.35)' },
          lineStyle: { color: '#35e0c8', width: 2 },
          itemStyle: { color: '#35e0c8' },
        },
      ],
    },
  ],
}

const infoRows = (data: Record<string, string>) =>
  Object.entries(data).map(([k, v]) => (
    <div key={k} style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
      <span style={{ color: '#7a8ba3', width: 72, flexShrink: 0 }}>{k}</span>
      <span style={{ color: '#c9d4e3' }}>{v}</span>
    </div>
  ))

export default function HydraulicAnalysis() {
  const [loading, setLoading] = useState(false)
  const [evaluation, setEvaluation] = useState<{ advantages: string; improvements: string } | null>(null)

  const run = async () => {
    setLoading(true)
    try {
      setEvaluation(await analyzeHydraulic())
    } catch (e) {
      message.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const renderLines = (text: string) =>
    text
      .split('\n')
      .map((s) => s.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean)
      .map((s, i) => <li key={i}>{s}</li>)

  return (
    <div className="fade-up">
      <div className="page-subtitle">分析 300 吨级液压挖掘机核心系统</div>

      <SectionCard title="液压系统拓扑图">
        <FlowDiagram
          nodes={[
            { name: '发动机', icon: '🔥' },
            { name: '液压泵', icon: '🔄' },
            { name: '主控阀', icon: '🔀' },
            { name: '油缸 / 马达', icon: '⚙' },
          ]}
        />
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
        <SectionCard title="泵系统">
          {infoRows({
            泵数量: hitachiProfile.hydraulic.pumpSystem.pumpCount,
            泵类型: hitachiProfile.hydraulic.pumpSystem.pumpType,
            流量特点: hitachiProfile.hydraulic.pumpSystem.flowFeature,
          })}
        </SectionCard>

        <SectionCard title="控制策略">
          {infoRows({
            功率匹配: hitachiProfile.hydraulic.controlStrategy.powerMatch,
            负载控制: hitachiProfile.hydraulic.controlStrategy.loadControl,
            节能策略: hitachiProfile.hydraulic.controlStrategy.energySaving,
          })}
        </SectionCard>

        <SectionCard title="系统能力雷达">
          <ReactECharts option={radarOption} style={{ height: 200 }} />
        </SectionCard>
      </div>

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
              点击「AI 生成评价」，由大模型基于竞品手册生成液压系统优势与改进方向。
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
  )
}
