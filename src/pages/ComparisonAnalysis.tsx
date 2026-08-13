import { useState } from 'react'
import { Button, Table, Spin, Tag, message } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import SectionCard from '../components/SectionCard'
import { compareDims, compareText } from '../data/mock'
import { compareProducts } from '../api/deepseek'

const barOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['日立 EX2600-7E', '徐工 300 吨级'], textStyle: { color: '#8b98ab' } },
  grid: { left: 44, right: 20, top: 44, bottom: 30 },
  xAxis: {
    type: 'category',
    data: compareDims.map((d) => d.label),
    axisLabel: { color: '#8b98ab', interval: 0 },
    axisLine: { lineStyle: { color: '#1f2a40' } },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#8b98ab' },
    splitLine: { lineStyle: { color: '#1f2a40' } },
  },
  series: [
    {
      name: '日立 EX2600-7E',
      type: 'bar',
      data: compareDims.map((d) => d.hitachi),
      itemStyle: { color: '#2f81f7' },
      barMaxWidth: 28,
    },
    {
      name: '徐工 300 吨级',
      type: 'bar',
      data: compareDims.map((d) => d.xcmg),
      itemStyle: { color: '#f5b301' },
      barMaxWidth: 28,
    },
  ],
}

export default function ComparisonAnalysis() {
  const [loading, setLoading] = useState(false)
  const [evalResult, setEvalResult] = useState<{
    advantages: string
    differences: string
    suggestions: string
  } | null>(null)

  const sysColumns = [
    { title: '对比维度', dataIndex: 'label', key: 'label', width: 120 },
    { title: '日立 EX2600-7E', dataIndex: 'hitachi', key: 'hitachi' },
    { title: '徐工 300 吨级', dataIndex: 'xcmg', key: 'xcmg' },
  ]

  const run = async () => {
    setLoading(true)
    try {
      setEvalResult(await compareProducts())
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
    <div className="fade-up">
      <div className="page-subtitle">日立 EX2600-7E vs 徐工 300 吨级，生成产品开发参考</div>

      <SectionCard title="产品参数对比">
        <ReactECharts option={barOption} style={{ height: 320 }} />
      </SectionCard>

      <div style={{ marginTop: 16 }}>
        <SectionCard title="系统方案对比">
          <Table
            rowKey="label"
            columns={sysColumns}
            dataSource={compareText.system}
            pagination={false}
            size="middle"
          />
        </SectionCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <SectionCard
          title="AI 评价"
          accent
          extra={
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={run} loading={loading}>
              AI 生成评价
            </Button>
          }
        >
          {!evalResult ? (
            <div style={{ color: '#5b6a80', fontSize: 13 }}>
              点击「AI 生成评价」，由大模型输出优势、差异与开发建议。
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
    </div>
  )
}
