import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  ApartmentOutlined,
  ToolOutlined,
  SettingOutlined,
  BarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ResourceLibrary from './pages/ResourceLibrary'
import AiAnalysis from './pages/AiAnalysis'
import OverallAnalysis from './pages/OverallAnalysis'
import HydraulicAnalysis from './pages/HydraulicAnalysis'
import MaintenanceAnalysis from './pages/MaintenanceAnalysis'
import ComparisonAnalysis from './pages/ComparisonAnalysis'
import AiAssistant from './pages/AiAssistant'
import ReportCenter from './pages/ReportCenter'

const { Sider, Header, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '首页' },
  { key: '/resources', icon: <DatabaseOutlined />, label: '竞品资料库' },
  { key: '/ai-analysis', icon: <ExperimentOutlined />, label: 'AI智能分析' },
  { key: '/overall', icon: <ApartmentOutlined />, label: '总体方案分析' },
  { key: '/hydraulic', icon: <SettingOutlined />, label: '液压系统分析' },
  { key: '/maintenance', icon: <ToolOutlined />, label: '保养维护分析' },
  { key: '/comparison', icon: <BarChartOutlined />, label: '竞品对比分析' },
  { key: '/assistant', icon: <RobotOutlined />, label: 'AI工程助手' },
  { key: '/report', icon: <FileTextOutlined />, label: '报告生成中心' },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={224} theme="dark" style={{ borderRight: '1px solid #1e2836' }}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 20px',
            borderBottom: '1px solid #1e2836',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #35e0c8, #1fa894)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#04110e',
              fontSize: 16,
              boxShadow: '0 0 14px rgba(53,224,200,0.4)',
            }}
          >
            矿
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>矿擎智鉴</div>
            <div style={{ fontSize: 11, color: '#7a8ba3' }}>矿挖竞品技术洞察平台</div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ paddingTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            height: 64,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e2836',
            background: '#0a0f16',
          }}
        >
          <span style={{ fontSize: 15, color: '#e6edf5', letterSpacing: 0.5 }}>
            <span style={{ color: '#f5a623' }}>AI赋能</span>的矿挖竞品技术洞察与产品决策平台
          </span>
          <span className="hud-status">
            <span className="lamp" />
            系统在线 · SYSTEM ONLINE
          </span>
        </Header>
        <Content style={{ padding: 24, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resources" element={<ResourceLibrary />} />
            <Route path="/ai-analysis" element={<AiAnalysis />} />
            <Route path="/overall" element={<OverallAnalysis />} />
            <Route path="/hydraulic" element={<HydraulicAnalysis />} />
            <Route path="/maintenance" element={<MaintenanceAnalysis />} />
            <Route path="/comparison" element={<ComparisonAnalysis />} />
            <Route path="/assistant" element={<AiAssistant />} />
            <Route path="/report" element={<ReportCenter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
