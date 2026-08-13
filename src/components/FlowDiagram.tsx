import { Fragment } from 'react'

interface FlowNode {
  name: string
  icon?: string
}

interface FlowDiagramProps {
  nodes: FlowNode[]
  direction?: 'horizontal' | 'vertical'
}

export default function FlowDiagram({ nodes, direction = 'horizontal' }: FlowDiagramProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      {nodes.map((n, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="flow-arrow">{direction === 'horizontal' ? '→' : '↓'}</span>
          )}
          <div className="flow-node">
            {n.icon && <span className="flow-icon">{n.icon}</span>}
            <span className="flow-name">{n.name}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
