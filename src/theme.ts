import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

// 工业 SCADA/HUD 主题：深矿黑 + 冷却液青 + 工程黄
export const themeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#35e0c8',
    colorInfo: '#35e0c8',
    colorSuccess: '#35e0c8',
    colorWarning: '#f5a623',
    colorBgBase: '#07090d',
    colorBgContainer: '#0e131c',
    colorBgElevated: '#141b27',
    colorBorder: '#1e2836',
    colorBorderSecondary: '#18212e',
    colorText: '#e6edf5',
    colorTextSecondary: '#7a8ba3',
    colorLink: '#35e0c8',
    borderRadius: 4,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#0a0f16',
      headerBg: '#0a0f16',
      bodyBg: '#07090d',
    },
    Menu: {
      darkItemBg: '#0a0f16',
      darkItemSelectedBg: '#12262a',
      darkItemSelectedColor: '#35e0c8',
      itemBorderRadius: 4,
    },
    Card: {
      colorBgContainer: '#0e131c',
    },
    Table: {
      colorBgContainer: '#0e131c',
      headerBg: '#141b27',
      headerColor: '#35e0c8',
      borderColor: '#1e2836',
    },
    Input: {
      colorBgContainer: '#0b1019',
      activeBorderColor: '#35e0c8',
      hoverBorderColor: '#1fa894',
    },
    Button: {
      colorPrimary: '#35e0c8',
      primaryColor: '#04110e',
    },
    Select: {
      colorBgContainer: '#0b1019',
      optionSelectedBg: '#12262a',
    },
  },
}
