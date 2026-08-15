import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { themeConfig } from './theme'
import { AnalysisProvider } from './store/AnalysisContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AnalysisProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AnalysisProvider>
    </ConfigProvider>
  </StrictMode>,
)
