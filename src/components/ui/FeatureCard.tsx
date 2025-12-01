import { ReactNode } from 'react'

export interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
  style?: React.CSSProperties
}

const FeatureCard = ({ icon, title, description, className = '', style }: FeatureCardProps) => {
  return (
    <div className={`feature-card ${className} flex flex-col h-full`} style={style}>
      <div className="flex flex-col items-center text-center flex-grow">
        <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mb-4 text-white">
          {icon}
        </div>
        <h3 className="text-[20px] md:text-[22px] font-semibold text-white mb-2">{title}</h3>
        <p className="text-[#b0b0b0] text-sm leading-relaxed flex-grow">{description}</p>
      </div>
    </div>
  )
}

export default FeatureCard
























