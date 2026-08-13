import { useState } from 'react'
import { Tree, Table, Button, Upload, Tag, message, Space } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { UploadOutlined, ThunderboltOutlined } from '@ant-design/icons'
import SectionCard from '../components/SectionCard'
import { brandTreeData, sourceFiles } from '../data/mock'
import type { SourceFile } from '../types'

export default function ResourceLibrary() {
  const [files, setFiles] = useState<SourceFile[]>(sourceFiles)

  const columns = [
    { title: '文件名称', dataIndex: 'name', key: 'name' },
    { title: '文件类型', dataIndex: 'type', key: 'type', width: 100 },
    {
      title: '解析状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: string) => (s === '已解析' ? <Tag color="success">已解析</Tag> : <Tag>待解析</Tag>),
    },
    { title: '上传时间', dataIndex: 'uploadTime', key: 'uploadTime', width: 180 },
  ]

  const handleUpload = (file: File) => {
    const name = file.name
    const ext = name.split('.').pop()?.toUpperCase() ?? 'PDF'
    setFiles((prev) => [
      ...prev,
      {
        key: String(Date.now()),
        name,
        type: ext,
        status: '待解析',
        uploadTime: '2026-08-13 刚刚',
      },
    ])
    message.success(`已上传 ${name}`)
    return false // 阻止自动上传
  }

  const startParse = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, status: '已解析' })))
    message.success('AI 解析完成，已生成竞品技术档案')
  }

  return (
    <div className="fade-up">
      <div className="page-subtitle">管理竞品 PDF 资料，AI 自动解析生成技术档案</div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <SectionCard title="品牌目录">
          <Tree
            treeData={brandTreeData as DataNode[]}
            defaultExpandAll
            selectable={false}
            showLine
          />
        </SectionCard>

        <SectionCard
          title="文件列表"
          extra={
            <Space>
              <Upload showUploadList={false} beforeUpload={handleUpload}>
                <Button icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={startParse}>
                开始AI解析
              </Button>
            </Space>
          }
        >
          <Table
            rowKey="key"
            columns={columns}
            dataSource={files}
            pagination={false}
            size="middle"
          />
        </SectionCard>
      </div>
    </div>
  )
}
