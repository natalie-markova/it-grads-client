import Section from '../../ui/Section'
import FeatureCard from '../../ui/FeatureCard'
import { Brain, Briefcase, TrendingUp } from 'lucide-react'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const AI = () => {
  useScrollAnimation()
  const aiFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Персональный карьерный консультант',
      description: 'ИИ-чат-бот помогает определить сильные стороны, выбрать направление и найти идеальную работу.',
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: 'Автоматическое создание резюме',
      description: 'Генерация резюме в различных форматах на основе профиля и проектов, с возможностью кастомизации под вакансию.',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Анализ вакансии на соответствие',
      description: 'ИИ анализирует текст вакансии, сравнивая требуемые навыки с вашими, и оценивает соответствие в процентах.',
    },
  ]

  return (
    <div className="bg-dark-bg min-h-screen">
      <Section 
        title="Искусственный интеллект и автоматизация"
        subtitle="Персонализированные рекомендации и оптимизация поиска"
        className="bg-dark-bg scroll-animate-item"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
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

