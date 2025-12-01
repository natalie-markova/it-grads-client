import { ReactNode } from 'react'

export interface SectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  titleClassName?: string
}

const Section = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  titleClassName = ''
}: SectionProps) => {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className={`section-title ${titleClassName}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="section-subtitle mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export default Section

























