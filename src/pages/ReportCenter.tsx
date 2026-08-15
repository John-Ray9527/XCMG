import { useState } from 'react'
import { Button, Result, message } from 'antd'
import { FileWordOutlined, FilePptOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Document, Packer, Paragraph, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import PptxGenJS from 'pptxgenjs'
import SectionCard from '../components/SectionCard'
import RequireKnowledge from '../components/RequireKnowledge'
import { useAnalysis } from '../store/AnalysisContext'
import { buildReport } from '../api/deepseek'
import type { ReportData } from '../api/deepseek'

const DEFAULT_TITLE = '竞品技术分析报告'

async function exportWord(report: ReportData) {
  const title = report.title || DEFAULT_TITLE
  const children = report.sections.flatMap((c) => [
    new Paragraph({ text: c.title, heading: HeadingLevel.HEADING_1 }),
    ...c.paras.map((p) => new Paragraph({ text: p })),
  ])
  const doc = new Document({
    sections: [{ children: [new Paragraph({ text: title, heading: HeadingLevel.TITLE }), ...children] }],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${title}.docx`)
}

function exportPpt(report: ReportData) {
  const title = report.title || DEFAULT_TITLE
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDE'

  const cover = pptx.addSlide()
  cover.background = { color: '0A0E16' }
  cover.addText(title, { x: 0.5, y: 2.6, w: 12.3, fontSize: 32, bold: true, color: '35E0C8', align: 'center' })
  cover.addText('矿擎智鉴 · AI驱动的超大型矿山装备竞品技术洞察与产品决策平台', {
    x: 0.5, y: 3.7, w: 12.3, fontSize: 18, color: '7A8BA3', align: 'center',
  })

  report.sections.forEach((c) => {
    const s = pptx.addSlide()
    s.background = { color: '0A0E16' }
    s.addText(c.title, { x: 0.6, y: 0.5, w: 12, fontSize: 26, bold: true, color: '35E0C8' })
    s.addText(
      c.paras.map((p) => ({ text: p, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } })),
      { x: 0.9, y: 1.5, w: 11.5, h: 5.4, fontSize: 15, color: 'E6EDF5' },
    )
  })

  pptx.writeFile({ fileName: `${title}.pptx` })
}

export default function ReportCenter() {
  const { profile, entries } = useAnalysis()
  const [report, setReport] = useState<ReportData | null>(null)

  const generate = () => {
    const data = buildReport(profile, entries)
    setReport(data)
    localStorage.setItem('kq_last_report', data.title || DEFAULT_TITLE)
    message.success('报告已基于知识库生成，可导出 Word / PPT')
  }

  return (
    <RequireKnowledge>
      <div className="fade-up">
        <div className="page-subtitle">基于已建立的知识库动态生成竞品分析报告，导出 Word / PPT</div>

        {!report ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <Result
              icon={<ThunderboltOutlined style={{ color: '#f5a623' }} />}
              title="生成竞品技术分析报告"
              subTitle={`系统根据已建立的知识库（${entries.length} 条技术切片）自动组装报告章节`}
              extra={
                <Button type="primary" size="large" onClick={generate}>
                  一键生成报告
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button type="primary" icon={<FileWordOutlined />} onClick={() => exportWord(report)}>
                导出 Word
              </Button>
              <Button icon={<FilePptOutlined />} onClick={() => exportPpt(report)} style={{ borderColor: '#f5a623', color: '#f5a623' }}>
                导出 PPT
              </Button>
              <span style={{ fontSize: 12, color: '#7a8ba3' }}>报告对象：{report.product} · 共 {report.sections.length} 章节</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {report.sections.map((c) => (
                <SectionCard key={c.title} title={c.title}>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#c9d4e3', lineHeight: 2 }}>
                    {c.paras.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </SectionCard>
              ))}
            </div>
          </>
        )}
      </div>
    </RequireKnowledge>
  )
}
