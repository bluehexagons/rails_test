import { ReactNode, CSSProperties } from 'react'
import './PageContainer.css'

interface PageContainerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  cardClassName?: string
}

export function PageContainer({ children, className = '', style, cardClassName = '' }: PageContainerProps) {
  return (
    <div className={`container ${className}`.trim()} style={style}>
      <div className={`card ${cardClassName}`.trim()}>
        {children}
      </div>
    </div>
  )
}
