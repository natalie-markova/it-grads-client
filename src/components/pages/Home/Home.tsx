import { Link } from 'react-router-dom'
import { ArrowRight, Users, Briefcase, Brain, Code, MessageCircle, TrendingUp } from 'lucide-react'
import Section from '../../../components/ui/Section'
import FeatureCard from '../../../components/ui/FeatureCard'
import Card from '../../../components/ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const Home = () => {
  useScrollAnimation()
  const topFeatures = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Навыки и Проекты',
      description: 'Визуализируйте свои умения и демонстрируйте портфолио.',
      link: '/skills',
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: 'Подготовка к Собеседованию',
      description: 'Симулятор для отработки навыков прохождения интервью.',
      link: '/interview',
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'ИИ и Автоматизация',
      description: 'Персонализированные рекомендации и оптимизация поиска.',
      link: '/ai',
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: 'Вакансии',
      description: 'Найдите работу мечты среди тысяч актуальных вакансий.',
      link: '/jobs',
    },
  ]

  return (
    <div className="bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center scroll-scale">
            <h1 className="text-[32px] md:text-[36px] font-bold mb-6 text-white">
              IT-Grads: Ваш Путь к Успеху в IT
            </h1>
            <p className="text-base text-[#b0b0b0] mb-8 max-w-3xl mx-auto">
              Мы создаем платформу, которая поможет выпускникам IT-школ и молодым специалистам 
              найти работу мечты и пройти собеседования с уверенностью.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/registration" className="btn-primary inline-flex items-center justify-center">
                Начать бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/home" className="btn-secondary">
                Узнать больше
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Features */}
      <Section className="bg-dark-bg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {topFeatures.map((feature, index) => (
            <Link key={index} to={feature.link} className="block h-full">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="h-full scroll-animate-item"
                style={{ transitionDelay: `${index * 0.1}s` }}
              />
            </Link>
          ))}
        </div>
      </Section>

      {/* Skills and Projects Section */}
      <Section 
        title="Фокус на навыках и проектах"
        className="bg-dark-bg scroll-animate-item"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <Link to="/skills" className="block scroll-fade-left">
            <div>
              <h3 className="text-[20px] md:text-[22px] font-semibold text-white mb-4">
                Интерактивная карта навыков
              </h3>
              <p className="text-[#b0b0b0] text-base mb-4 leading-relaxed">
                Забудьте о скучных списках! Наша интерактивная карта показывает связи между вашими умениями. 
                Кликните на навык, чтобы увидеть:
              </p>
              <ul className="space-y-2 text-[#b0b0b0] text-base mb-6">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Актуальные вакансии</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Релевантные проекты</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Рекомендуемые курсы</span>
                </li>
              </ul>
              <div className="bg-dark-surface rounded-xl p-8 border border-dark-card hover:border-accent-cyan transition-all cursor-pointer">
                <div className="relative w-full h-64 bg-gradient-to-br from-accent-cyan/20 via-accent-blue/20 to-dark-card rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-accent-cyan/30 rounded-full shadow-glow-cyan animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-accent-cyan rounded-full shadow-glow-cyan"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="text-white font-semibold">Интерактивная карта</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Column */}
          <div className="scroll-fade-right">
            <h3 className="text-[20px] md:text-[22px] font-semibold text-white mb-4">
              Автоматический анализ проектов
            </h3>
            <p className="text-[#b0b0b0] text-base mb-4 leading-relaxed">
              Интеграция с GitHub API для автоматического анализа ваших проектов. 
              Мы определяем:
            </p>
            <ul className="space-y-2 text-[#b0b0b0] text-base mb-6">
              <li className="flex items-start">
                <span className="text-accent-cyan mr-2">•</span>
                <span>Используемые технологии</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent-cyan mr-2">•</span>
                <span>Архитектурные решения</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent-cyan mr-2">•</span>
                <span>Качество кода (статический анализ)</span>
              </li>
            </ul>
            <Link to="/skills" className="block">
              <div className="bg-dark-surface rounded-xl p-8 border border-dark-card hover:border-accent-cyan transition-all cursor-pointer">
                <div className="relative w-full h-64 bg-gradient-to-br from-dark-card via-accent-blue/10 to-dark-surface rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-accent-blue/20 rounded-lg shadow-glow-cyan rotate-45"></div>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-accent-cyan/20 rounded border border-accent-cyan/30"
                      ></div>
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2">⚙️</div>
                    <div className="text-white font-semibold">Анализ проектов</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Section>

      {/* Ratings and Simulation Section */}
      <Section 
        title="Рейтинги и симуляция"
        className="bg-dark-surface scroll-animate-item"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <Link to="/companies" className="block scroll-fade-left">
            <div>
              <h3 className="text-[20px] md:text-[22px] font-semibold text-white mb-4">
                Рейтинг и отзывы работодателей
              </h3>
              <p className="text-[#b0b0b0] text-base mb-4 leading-relaxed">
                Прозрачная среда для анонимных отзывов о компаниях. 
                Создаем честную экосистему, где:
              </p>
              <ul className="space-y-2 text-[#b0b0b0] text-base mb-6">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Честные оценки от сообщества</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Повышение имиджа компаний через обратную связь</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Возможность для компаний отвечать на отзывы</span>
                </li>
              </ul>
              <div className="bg-dark-card rounded-xl p-8 border border-dark-surface hover:border-accent-cyan transition-all cursor-pointer">
                <div className="relative w-full h-64 bg-gradient-to-br from-accent-gold/20 via-accent-cyan/20 to-dark-card rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-accent-gold/30 rounded-full shadow-glow-gold animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-accent-gold rounded-full shadow-glow-gold"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2">⭐</div>
                    <div className="text-white font-semibold">Рейтинги</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Right Column */}
          <Link to="/interview" className="block scroll-fade-right">
            <div>
              <h3 className="text-[20px] md:text-[22px] font-semibold text-white mb-4">
                Симулятор собеседования
              </h3>
              <p className="text-[#b0b0b0] text-base mb-4 leading-relaxed">
                Интерактивный тренажер для подготовки к реальным собеседованиям. 
                Практикуйтесь с:
              </p>
              <ul className="space-y-2 text-[#b0b0b0] text-base mb-6">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Генерация вопросов под вашу роль и технологии</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Мгновенная обратная связь</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">•</span>
                  <span>Советы от опытных специалистов для улучшения ответов</span>
                </li>
              </ul>
              <div className="bg-dark-card rounded-xl p-8 border border-dark-surface hover:border-accent-cyan transition-all cursor-pointer">
                <div className="relative w-full h-64 bg-gradient-to-br from-dark-surface via-accent-cyan/10 to-dark-card rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-accent-cyan/20 rounded-full border-4 border-accent-cyan border-dashed animate-spin-slow"></div>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-3 gap-4 p-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-accent-cyan/20 rounded-lg border border-accent-cyan/30 flex items-center justify-center"
                      >
                        <div className="text-2xl">❓</div>
                      </div>
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <div className="text-white font-semibold">Симулятор</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Section>

      {/* AI Section */}
      <Section 
        title="Искусственный интеллект и автоматизация"
        className="bg-dark-bg scroll-animate-item"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/ai" className="block">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Персональный карьерный консультант"
              description="ИИ-чат-бот помогает определить сильные стороны, выбрать направление и найти идеальную работу."
              className="scroll-animate-item"
              style={{ transitionDelay: '0s' }}
            />
          </Link>
          <Link to="/ai" className="block">
            <FeatureCard
              icon={<Briefcase className="h-8 w-8" />}
              title="Автоматическое создание резюме"
              description="Генерация резюме в различных форматах на основе профиля и проектов, с возможностью кастомизации под вакансию."
              className="scroll-animate-item"
              style={{ transitionDelay: '0.1s' }}
            />
          </Link>
          <Link to="/ai" className="block">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Анализ вакансии на соответствие"
              description="ИИ анализирует текст вакансии, сравнивая требуемые навыки с вашими, и оценивает соответствие в процентах."
              className="scroll-animate-item"
              style={{ transitionDelay: '0.2s' }}
            />
          </Link>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 border-y border-accent-cyan/30 scroll-scale">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[24px] md:text-[28px] font-bold mb-4 text-white">
            Готовы начать?
          </h2>
          <p className="text-base text-[#b0b0b0] mb-8">
            Присоединяйтесь к тысячам IT-специалистов, которые уже используют IT-Grads
          </p>
          <Link to="/registration" className="btn-primary inline-flex items-center">
            Создать аккаунт
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
