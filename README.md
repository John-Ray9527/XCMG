# 矿智研 · AI 竞品技术分析助手

面向 300 吨级超大型液压挖掘机产品总体工程师的 **AI 竞品技术分析平台**（Web Demo）。

> 「数智赋能·创享未来」AI 创新应用大赛 —— 方向二「AI+业务」网页工具创新赛 参赛作品

## 项目简介

通过 **AI 大模型 + 知识库技术**，实现竞品操作手册、维修手册、保养手册的智能解析，
辅助产品开发决策。核心能力：

- 📚 竞品资料库管理（PDF 上传与 AI 解析）
- 🤖 AI 智能分析（产品档案、技术关键词）
- 🏗 总体方案 / 液压系统 / 保养维护分析
- 📊 竞品对比与对标报告
- 📄 一键生成竞品技术分析报告（导出 Word / PPT）

## 技术栈

- 前端：React 19 + TypeScript + Vite
- UI：Ant Design 6
- 图表：ECharts
- AI：DeepSeek 大模型 API（浏览器直调）
- 导出：docx / pptxgenjs

## 本地运行

```bash
npm install
npm run dev        # 开发模式
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## 配置 AI Key

复制 `.env.example` 为 `.env`，填入 DeepSeek API Key：

```bash
VITE_DEEPSEEK_API_KEY=sk-你的Key
```

> `.env` 已加入 `.gitignore`，不会被提交。

## 部署

部署到 GitHub Pages（仓库 `XCMG`）：

```bash
npm run deploy
```

## 页面结构

1. 首页 Dashboard
2. 竞品资料库
3. AI 智能分析
4. 总体方案分析
5. 液压系统分析
6. 保养维护分析
7. 竞品对比分析
8. AI 工程助手
9. 报告生成中心
