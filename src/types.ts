// 竞品技术档案相关类型定义

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
  status: '已解析' | '待解析'
  uploadTime: string
}
