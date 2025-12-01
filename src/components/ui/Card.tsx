import { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  style?: React.CSSProperties
}

const Card = ({ children, className = '', hover = true, style }: CardProps) => {
  return (
    <div className={`card ${hover ? 'hover:shadow-glow-cyan' : ''} ${className}`} style={style}>
      {children}
    </div>
  )
}

export default Card

























