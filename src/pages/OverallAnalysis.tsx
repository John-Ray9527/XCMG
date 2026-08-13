import SectionCard from '../components/SectionCard'
import FlowDiagram from '../components/FlowDiagram'
import { hitachiProfile } from '../data/mock'

const designFeatures = [
  { title: '优势', items: ['正铲结构作业效率高', '模块化设计便于维修', '双回路液压独立供油'] },
  { title: '特点', items: ['电驱动/柴油双动力可选', '远程智能监控', '大斗容匹配短循环'] },
]

const structureParts = [
  { name: '动臂 / 斗杆', icon: '🏗', desc: '工作装置' },
  { name: '回转平台', icon: '🔄', desc: '上部结构' },
  { name: '发动机', icon: '🔥', desc: '动力系统' },
  { name: '液压系统', icon: '⚙', desc: '驱动系统' },
]

export default function OverallAnalysis() {
  return (
    <div className="fade-up">
      <div className="page-subtitle">解析日立 EX2600-7E 总体方案，突出产品总体工程师价值</div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        {/* 左：设备结构示意 */}
        <SectionCard title="设备结构示意">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {structureParts.map((p) => (
              <div
                key={p.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  border: '1px solid #1f2a40',
                  borderRadius: 8,
                  background: '#151f31',
                }}
              >
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#8b98ab' }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 右：AI 分析结果 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionCard title="模块1 · 总体布置">
            <ul style={{ margin: 0, paddingLeft: 18, color: '#c9d4e3', lineHeight: 2 }}>
              {hitachiProfile.overallLayout.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="模块2 · 系统架构">
            <FlowDiagram
              nodes={hitachiProfile.systemFlow.map((n) => ({ name: n }))}
            />
          </SectionCard>

          <SectionCard title="模块3 · 设计特点总结" accent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {designFeatures.map((g) => (
                <div key={g.title}>
                  <div style={{ fontWeight: 600, color: '#f5b301', marginBottom: 8 }}>{g.title}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#c9d4e3', lineHeight: 2 }}>
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
