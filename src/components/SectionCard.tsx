import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  accent?: boolean
  children: ReactNode
  extra?: ReactNode
}

export default function SectionCard({ title, accent, children, extra }: SectionCardProps) {
  return (
    <div className={accent ? 'tech-card tech-card--accent' : 'tech-card'}>
      <div className={accent ? 'card-title card-title--yellow' : 'card-title'}>
        <span className="dot" />
        <span>{title}</span>
        {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
      </div>
      {children}
    </div>
  )
}
