import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

// 工业科技风主题：深灰 + 科技蓝 + 工程机械黄
export const themeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2f81f7',
    colorInfo: '#22d3ee',
    colorBgBase: '#0a0e16',
    colorBgContainer: '#101827',
    colorBgElevated: '#151f31',
    colorBorder: '#1f2a40',
    colorBorderSecondary: '#1a2438',
    colorText: '#e7eef7',
    colorTextSecondary: '#8b98ab',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#0c1220',
      headerBg: '#0c1220',
      bodyBg: '#0a0e16',
    },
    Menu: {
      darkItemBg: '#0c1220',
      darkItemSelectedBg: '#152238',
      darkItemSelectedColor: '#4c9bff',
      itemBorderRadius: 6,
    },
    Card: {
      colorBgContainer: '#101827',
    },
    Table: {
      colorBgContainer: '#101827',
      headerBg: '#151f31',
    },
    Input: {
      colorBgContainer: '#0d1422',
    },
  },
}
