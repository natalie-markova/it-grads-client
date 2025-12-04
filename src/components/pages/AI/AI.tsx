import { useTranslation } from 'react-i18next'
import Section from '../../ui/Section'
import FeatureCard from '../../ui/FeatureCard'
import { Brain, Briefcase, TrendingUp } from 'lucide-react'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const AI = () => {
  const { t } = useTranslation()
  useScrollAnimation()

  const aiFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      titleKey: 'ai.careerConsultant.title',
      descriptionKey: 'ai.careerConsultant.description',
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      titleKey: 'ai.resumeCreation.title',
      descriptionKey: 'ai.resumeCreation.description',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      titleKey: 'ai.vacancyAnalysis.title',
      descriptionKey: 'ai.vacancyAnalysis.description',
    },
  ]

  return (
    <div className="bg-dark-bg min-h-screen">
      <Section
        title={t('ai.title')}
        subtitle={t('ai.subtitle')}
        className="bg-dark-bg scroll-animate-item"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
              className="scroll-animate-item"
              style={{ transitionDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      </Section>
    </div>
  )
}

export default AI

