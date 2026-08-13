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
      <Sider width={224} theme="dark" style={{ borderRight: '1px solid #1f2a40' }}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 20px',
            borderBottom: '1px solid #1f2a40',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2f81f7, #22d3ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: 16,
            }}
          >
            矿
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>矿智研</div>
            <div style={{ fontSize: 11, color: '#8b98ab' }}>竞品技术分析助手</div>
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
            borderBottom: '1px solid #1f2a40',
            background: '#0c1220',
          }}
        >
          <span style={{ fontSize: 15, color: '#e7eef7' }}>
            AI 驱动的 <span style={{ color: '#f5b301' }}>300 吨级</span>液压挖掘机竞品技术分析平台
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
