// 竞品技术档案相关类型定义

// ── V2.0：由上传资料经 AI 分析动态生成 ─────────────────────────────
// 竞品产品画像（来自 /api/analyze）
export interface CompetitorProfile {
  brand: string
  model: string
  type: string
  tonnage: string
  keywords: string[]
}

// 知识条目（AI 从上传资料中抽取的切片，供检索/溯源/动态生成）
export interface KnowledgeEntry {
  id: string
  system: string
  source: string
  page: string
  original_text: string
  translation: string
  engineering_analysis: string
  development_advice: string
  technical_tags: string[]
  zh_keywords: string[]
}

export interface PumpSystem {
  pumpCount: string
  pumpType: string
  flowFeature: string
}

export interface ControlStrategy {
  powerMatch: string
  loadControl: string
  energySaving: string
}

export interface HydraulicInfo {
  pumpSystem: PumpSystem
  controlStrategy: ControlStrategy
}

export interface MaintenanceItem {
  key: string
  system: string
  item: string
  interval: string
  source: string
}

export interface ProductProfile {
  brand: string
  model: string
  type: string
  tonnage: string
  keywords: string[]
  overallLayout: string[]
  systemFlow: string[]
  hydraulic: HydraulicInfo
  maintenance: MaintenanceItem[]
}

export interface CompareDim {
  label: string
  unit: string
  hitachi: number
  xcmg: number
}

export interface SourceFile {
  key: string
  name: string
  type: string
  status: '已建立知识索引' | '待解析'
  uploadTime: string
}

export interface EngineeringCompareItem {
  label: string
  hitachi: string
  ours: string
  insight: string
}
