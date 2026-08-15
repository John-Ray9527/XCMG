import PptxGenJS from 'pptxgenjs'

const pptx = new PptxGenJS()
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 })
pptx.layout = 'WIDE'

const C = {
  bg: '07090D',
  panel: '0E131C',
  border: '1E2836',
  cyan: '35E0C8',
  cyanDark: '04110E',
  amber: 'F5A623',
  gray: '7A8BA3',
  light: 'E6EDF5',
  red: 'E5484D',
}
const F = 'Microsoft YaHei'

const slide = pptx.addSlide()
slide.background = { color: C.bg }

// ── 标题区 ─────────────────────────────────────────
slide.addText('让浏览器永远碰不到 Key —— 自建 Serverless 反代', {
  x: 0.6, y: 0.32, w: 12.1, h: 0.62, fontSize: 28, bold: true, color: C.cyan, fontFace: F,
})
slide.addText('一个纯前端 Demo，也能按生产级标准守住 API 密钥安全', {
  x: 0.6, y: 0.98, w: 12.1, h: 0.4, fontSize: 14, color: C.gray, fontFace: F,
})
slide.addShape(pptx.ShapeType.rect, {
  x: 0.6, y: 1.46, w: 12.1, h: 0.02, fill: { color: C.cyan },
})

// ── 左列：痛点 + 架构图 ─────────────────────────────
// 痛点
slide.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 1.72, w: 6.15, h: 1.7, fill: { color: C.panel }, line: { color: C.amber, width: 1 }, rectRadius: 0.06,
})
slide.addText('痛点', { x: 0.85, y: 1.86, w: 2, h: 0.35, fontSize: 15, bold: true, color: C.amber, fontFace: F })
slide.addText('纯前端 + 浏览器直调大模型，API Key 被迫写进前端代码，\n打包后明文躺在公网 JS 里，任何人都能扒取、盗刷额度。', {
  x: 0.85, y: 2.22, w: 5.7, h: 1.0, fontSize: 12.5, color: C.light, fontFace: F, lineSpacingMultiple: 1.3,
})

// 破局架构图
slide.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 3.62, w: 6.15, h: 3.28, fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.06,
})
slide.addText('破局：把密钥从「浏览器」挪到「服务端」', {
  x: 0.85, y: 3.74, w: 5.7, h: 0.35, fontSize: 14, bold: true, color: C.cyan, fontFace: F,
})

// 三个节点
const box = (x, w, label, sub, lineColor) => {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 4.42, w, h: 0.95, fill: { color: C.cyanDark }, line: { color: lineColor, width: 1.5 }, rectRadius: 0.08,
  })
  slide.addText(label, { x, y: 4.5, w, h: 0.45, fontSize: 14, bold: true, color: C.cyan, align: 'center', fontFace: F })
  if (sub) slide.addText(sub, { x, y: 4.95, w, h: 0.35, fontSize: 9.5, color: C.gray, align: 'center', fontFace: F })
}
box(0.82, 1.35, '浏览器', null, C.border)
box(2.98, 1.95, 'Vercel 反代', 'Key 只存这里', C.cyan)
box(5.75, 1.35, 'DeepSeek', null, C.border)

// 箭头 + 标注
slide.addText('→', { x: 2.2, y: 4.42, w: 0.75, h: 0.95, fontSize: 22, bold: true, color: C.cyan, align: 'center', fontFace: F })
slide.addText('→', { x: 4.96, y: 4.42, w: 0.75, h: 0.95, fontSize: 22, bold: true, color: C.cyan, align: 'center', fontFace: F })
slide.addText('① 只传问题（无 Key）', { x: 1.6, y: 5.5, w: 2.0, h: 0.3, fontSize: 10, color: C.gray, align: 'center', fontFace: F })
slide.addText('② 服务端携 Key 调用', { x: 4.3, y: 5.5, w: 2.1, h: 0.3, fontSize: 10, color: C.gray, align: 'center', fontFace: F })
slide.addText('④ 答案原路返回（无 Key）', { x: 0.82, y: 5.86, w: 6.1, h: 0.3, fontSize: 10, color: C.gray, align: 'center', fontFace: F })
slide.addText('改 Key 只改服务端，无需重新发版前端', {
  x: 0.85, y: 6.32, w: 5.7, h: 0.35, fontSize: 11, color: C.amber, align: 'center', fontFace: F,
})

// ── 右列：三个关键设计 + 验证结果 ────────────────────
const designs = [
  ['密钥零进前端', 'Key 只存服务端环境变量（Sensitive），不进仓库、不进 bundle'],
  ['前端只认反代地址', '浏览器请求反代 URL，全链路不接触密钥'],
  ['反代做收口', '统一 CORS、收敛模型/参数，天然留好限流与日志扩展点'],
]
let dy = 1.72
slide.addText('三个关键设计', { x: 7.05, y: dy, w: 5.6, h: 0.35, fontSize: 15, bold: true, color: C.cyan, fontFace: F })
dy += 0.44
designs.forEach(([t, d], i) => {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.05, y: dy, w: 5.6, h: 0.82, fill: { color: C.panel }, line: { color: C.border, width: 1 }, rectRadius: 0.06,
  })
  slide.addText(String(i + 1), {
    x: 7.2, y: dy + 0.12, w: 0.4, h: 0.5, fontSize: 16, bold: true, color: C.cyan, align: 'center', fontFace: F,
  })
  slide.addText(t, { x: 7.68, y: dy + 0.06, w: 4.9, h: 0.34, fontSize: 13, bold: true, color: C.light, fontFace: F })
  slide.addText(d, { x: 7.68, y: dy + 0.4, w: 4.9, h: 0.34, fontSize: 10.5, color: C.gray, fontFace: F })
  dy += 0.94
})

// 验证结果
slide.addText('验证结果（有据可查）', { x: 7.05, y: 5.0, w: 5.6, h: 0.35, fontSize: 15, bold: true, color: C.cyan, fontFace: F })
const checks = [
  '反代调用 DeepSeek 实测返回正常',
  '线上 bundle 零密钥残留（脚本扫描 sk- 无命中）',
  'Cloudflare 风控封禁 → 30 分钟快速切换 Vercel 无损上线',
]
checks.forEach((c, i) => {
  slide.addText('✓  ' + c, { x: 7.15, y: 5.42 + i * 0.44, w: 5.5, h: 0.4, fontSize: 12, color: C.light, fontFace: F })
})

// ── 底部一句话 ─────────────────────────────────────
slide.addShape(pptx.ShapeType.roundRect, {
  x: 0.6, y: 7.02, w: 12.1, h: 0.42, fill: { color: C.cyanDark }, line: { color: C.cyan, width: 1 }, rectRadius: 0.1,
})
slide.addText('把大模型能力装进纯前端网页，同时让浏览器永远碰不到 Key。', {
  x: 0.6, y: 7.02, w: 12.1, h: 0.42, fontSize: 12.5, bold: true, color: C.cyan, align: 'center', fontFace: F,
})

await pptx.writeFile({ fileName: 'API反代-密钥安全亮点页.pptx' })
console.log('已生成：API反代-密钥安全亮点页.pptx')
