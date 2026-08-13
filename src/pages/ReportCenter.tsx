import { useState } from 'react'
import { Button, Result, message } from 'antd'
import { FileWordOutlined, FilePptOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Document, Packer, Paragraph, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import PptxGenJS from 'pptxgenjs'
import SectionCard from '../components/SectionCard'

const reportTitle = 'EX2600-7E 竞品技术分析报告'

const chapters = [
  {
    title: '一、产品概况',
    paras: [
      '产品型号：日立 EX2600-7E',
      '设备类型：矿用液压挖掘机（正铲）',
      '吨位等级：300 吨级',
      '核心技术关键词：液压系统、高可靠性、智能控制、大型矿山、维护便利性',
    ],
  },
  {
    title: '二、总体方案分析',
    paras: [
      '发动机中后置布置，降低整机重心，提升作业稳定性',
      '液压泵站与主控制阀分区布置，油路走向短、压损小',
      '维修走道与检修舱门环绕布置，关键部件可达性良好',
    ],
  },
  {
    title: '三、液压系统分析',
    paras: [
      '泵系统：3 组主泵 + 1 组先导泵，斜盘式变量柱塞泵，双回路独立供油',
      '控制策略：发动机-泵功率匹配、负载敏感 + 正流量控制、怠速自动降速 + 动臂势能回收',
      '技术评价：功率匹配与节能策略成熟，具备产品开发借鉴价值',
    ],
  },
  {
    title: '四、保养策略分析',
    paras: [
      '发动机机油更换：500h',
      '液压油滤芯检查：1000h，液压油更换：4000h',
      '回转齿圈润滑：250h',
    ],
  },
  {
    title: '五、技术特点总结',
    paras: [
      '正铲结构作业效率高，模块化设计便于维修',
      '双回路液压独立供油，回转与行走优先补偿',
      '电驱动 / 柴油双动力可选，远程智能监控',
    ],
  },
  {
    title: '六、产品开发启示',
    paras: [
      '对标 EX2600-7E 的势能回收与功率匹配策略，优化本司 300 吨级产品节能表现',
      '借鉴其模块化维修布局，缩短维护停机时间',
      '关注电驱动方案，布局新能源矿山装备',
    ],
  },
]

async function exportWord() {
  const children = chapters.flatMap((c) => [
    new Paragraph({ text: c.title, heading: HeadingLevel.HEADING_1 }),
    ...c.paras.map((p) => new Paragraph({ text: p })),
  ])
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: reportTitle, heading: HeadingLevel.TITLE }),
          ...children,
        ],
      },
    ],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${reportTitle}.docx`)
}

function exportPpt() {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDE'

  const cover = pptx.addSlide()
  cover.background = { color: '0A0E16' }
  cover.addText(reportTitle, {
    x: 0.5, y: 2.6, w: 12.3, fontSize: 32, bold: true, color: '2F81F7', align: 'center',
  })
  cover.addText('矿智研 · AI 竞品技术分析助手', {
    x: 0.5, y: 3.7, w: 12.3, fontSize: 18, color: '8B98AB', align: 'center',
  })

  chapters.forEach((c) => {
    const s = pptx.addSlide()
    s.background = { color: '0A0E16' }
    s.addText(c.title, { x: 0.6, y: 0.5, w: 12, fontSize: 26, bold: true, color: '2F81F7' })
    s.addText(
      c.paras.map((p) => ({ text: p, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } })),
      { x: 0.9, y: 1.5, w: 11.5, h: 5.4, fontSize: 16, color: 'E7EEF7' },
    )
  })

  pptx.writeFile({ fileName: `${reportTitle}.pptx` })
}

export default function ReportCenter() {
  const [generated, setGenerated] = useState(false)

  const generate = () => {
    setGenerated(true)
    message.success('报告已生成，可导出 Word / PPT')
  }

  return (
    <div className="fade-up">
      <div className="page-subtitle">一键生成竞品技术分析报告，导出 Word / PPT</div>

      {!generated ? (
        <div style={{ textAlign: 'center', paddingTop: 80 }}>
          <Result
            icon={<ThunderboltOutlined style={{ color: '#f5b301' }} />}
            title="生成《EX2600-7E 竞品技术分析报告》"
            subTitle="基于竞品技术档案，自动汇总六大章节内容"
            extra={
              <Button type="primary" size="large" onClick={generate}>
                一键生成报告
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <Button type="primary" icon={<FileWordOutlined />} onClick={() => exportWord()}>
              导出 Word
            </Button>
            <Button icon={<FilePptOutlined />} onClick={() => exportPpt()} style={{ borderColor: '#f5b301', color: '#f5b301' }}>
              导出 PPT
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {chapters.map((c) => (
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
  )
}
