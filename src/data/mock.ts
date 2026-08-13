import type { ProductProfile, MaintenanceItem, CompareDim, SourceFile } from '../types'

// 预置「日立 EX2600-7E」竞品技术档案（模拟 AI 文档解析结果）
export const hitachiProfile: ProductProfile = {
  brand: '日立 (HITACHI)',
  model: 'EX2600-7E',
  type: '矿用液压挖掘机（正铲）',
  tonnage: '300 吨级',
  keywords: ['液压系统', '高可靠性', '智能控制', '大型矿山', '维护便利性'],
  overallLayout: [
    '发动机中后置布置，降低整机重心，提升作业稳定性',
    '液压泵站与主控制阀分区布置，油路走向短、压损小',
    '维修走道与检修舱门环绕布置，关键部件可达性良好',
  ],
  systemFlow: ['发动机', '液压泵', '主控制阀', '执行机构'],
  hydraulic: {
    pumpSystem: {
      pumpCount: '3 组主泵 + 1 组先导泵',
      pumpType: '斜盘式变量柱塞泵',
      flowFeature: '大流量、双回路独立供油，回转与行走优先补偿',
    },
    controlStrategy: {
      powerMatch: '发动机-泵功率匹配（恒功率 + 变功率双模式）',
      loadControl: '负载敏感 + 正流量控制，按需供油',
      energySaving: '怠速自动降速 + 动臂势能回收',
    },
  },
  maintenance: [
    { key: '1', system: '发动机', item: '机油更换', interval: '500h', source: '保养手册 P12' },
    { key: '2', system: '发动机', item: '空气滤芯检查', interval: '250h', source: '保养手册 P13' },
    { key: '3', system: '液压系统', item: '液压油滤芯检查', interval: '1000h', source: '保养手册 P28' },
    { key: '4', system: '液压系统', item: '液压油更换', interval: '4000h', source: '保养手册 P29' },
    { key: '5', system: '行走机构', item: '减速机齿轮油检查', interval: '1000h', source: '保养手册 P35' },
    { key: '6', system: '回转机构', item: '回转齿圈润滑', interval: '250h', source: '保养手册 P40' },
  ],
}

// 竞品对比：日立 EX2600-7E vs 徐工 300 吨
export const compareDims: CompareDim[] = [
  { label: '整机重量', unit: 't', hitachi: 288, xcmg: 285 },
  { label: '斗容', unit: 'm³', hitachi: 17.5, xcmg: 16.5 },
  { label: '工作范围(最大挖掘半径)', unit: 'm', hitachi: 13.6, xcmg: 13.2 },
  { label: '额定功率', unit: 'kW', hitachi: 1120, xcmg: 1080 },
]

export const compareText = {
  product: {
    hitachi: '日立 EX2600-7E',
    xcmg: '徐工 300 吨级',
  },
  system: [
    { label: '动力系统', hitachi: '电驱动 + 柴油双动力可选', xcmg: '柴油动力为主' },
    { label: '液压系统', hitachi: '正流量 + 双回路独立供油', xcmg: '负载敏感控制' },
    { label: '控制系统', hitachi: '智能监控 + 远程诊断', xcmg: '车载 PLC 控制' },
  ],
}

// 资料库文件列表
export const sourceFiles: SourceFile[] = [
  { key: '1', name: '操作手册.pdf', type: 'PDF', status: '已解析', uploadTime: '2026-08-10 09:24' },
  { key: '2', name: '维修手册.pdf', type: 'PDF', status: '已解析', uploadTime: '2026-08-10 09:25' },
  { key: '3', name: '保养手册.pdf', type: 'PDF', status: '已解析', uploadTime: '2026-08-10 09:26' },
]

// 品牌目录树
export const brandTreeData = [
  {
    title: '日立 (HITACHI)',
    key: 'hitachi',
    children: [
      {
        title: 'EX2600-7E',
        key: 'ex2600',
        children: [
          { title: '操作手册.pdf', key: 'f1', isLeaf: true },
          { title: '维修手册.pdf', key: 'f2', isLeaf: true },
          { title: '保养手册.pdf', key: 'f3', isLeaf: true },
        ],
      },
    ],
  },
]

// 保养相关预设问答来源（用于展示「引用来源」）
export const maintenanceReference = {
  engine: '维修手册 P12',
  hydraulic: '维修手册 P28-29',
  general: '操作手册 P8',
}

export const maintenanceItems: MaintenanceItem[] = hitachiProfile.maintenance
