import { Link, useOutletContext } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRight, Users, MessageCircle, TrendingUp, GraduationCap, Building2, MapPin, Search, Star, Target, Sparkles, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Section from '../../../components/ui/Section'
import Card from '../../../components/ui/Card'
import MatrixRain from '../../../components/ui/MatrixRain'
import CareerGraph from '../../../components/ui/CareerGraph'
import AIScanner from '../../../components/ui/AIScanner'
import RatingStars from '../../../components/ui/RatingStars'
import RadarScan from '../../../components/ui/RadarScan'
import TowerBuilding from '../../../components/ui/TowerBuilding'
import CheckMarks from '../../../components/ui/CheckMarks'
import FilterFunnel from '../../../components/ui/FilterFunnel'
import SkillsRadar from '../../../components/ui/SkillsRadar'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { OutletContext } from '../../../types'
import { $api } from '../../../utils/axios.instance'

const Home = () => {
  const { user } = useOutletContext<OutletContext>()
  const { t, i18n } = useTranslation()
  const [totalUsers, setTotalUsers] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [hoveredEmployerCard, setHoveredEmployerCard] = useState<number | null>(null)

  useScrollAnimation()

  // Загрузка статистики пользователей
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const response = await $api.get('/user/count')
        const count = response.data.count || 0
        setTotalUsers(count * 10)
        setOnlineUsers(Math.floor((count * 10) * (0.1 + Math.random() * 0.2)))
      } catch (error) {
        console.error('Error loading user stats:', error)
        setTotalUsers(1000)
        setOnlineUsers(150)
      }
    }

    if (user) {
      loadUserStats()
      const interval = setInterval(loadUserStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Анимация счетчика
  const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      let startTime: number
      let animationFrame: number

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        const currentValue = Math.floor(progress * value)
        setDisplayValue(currentValue)

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          setDisplayValue(value)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }, [value, duration])

    return <span>{displayValue.toLocaleString('ru-RU')}</span>
  }

  // Преимущества для студентов
  const graduateFeatures = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('home.graduateFeatures.interview.title'),
      description: t('home.graduateFeatures.interview.description'),
      link: '/interview',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: t('home.graduateFeatures.search.title'),
      description: t('home.graduateFeatures.search.description'),
      link: '/jobs',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t('home.graduateFeatures.career.title'),
      description: t('home.graduateFeatures.career.description'),
      link: '/roadmap',
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: t('home.graduateFeatures.transparency.title'),
      description: t('home.graduateFeatures.transparency.description'),
      link: '/companies',
    },
  ]

  // Преимущества для работодателей
  const employerFeatures = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t('home.employerFeatures.map.title'),
      description: t('home.employerFeatures.map.description'),
      link: '/candidates/map',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: t('home.employerFeatures.search.title'),
      description: t('home.employerFeatures.search.description'),
      link: '/candidates',
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: t('home.employerFeatures.verified.title'),
      description: t('home.employerFeatures.verified.description'),
      link: '/candidates',
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: t('home.employerFeatures.reputation.title'),
      description: t('home.employerFeatures.reputation.description'),
      link: '/profile/employer',
    },
  ]

  return (
    <div className="bg-dark-bg overflow-hidden">
      {/* Massive Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg py-20 md:py-32">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent-cyan/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto scroll-scale">
            {/* Main Headline */}
            <h1 className="text-[40px] md:text-[56px] lg:text-[64px] font-bold leading-tight mb-6 text-white">
              {user?.role === 'employer' ? (
                <>
                  Найдите талантливых{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">IT-специалистов</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-accent-blue/30 -rotate-1"></span>
                  </span>
                </>
              ) : (
                <>
                  {t('home.heroTitle1')}{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10">IT-Grads</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-accent-cyan/30 -rotate-1"></span>
                  </span>{' '}
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
              {user?.role === 'employer' ? (
                <>
                  Платформа для поиска выпускников IT-школ.<br/>
                  Верифицированные кандидаты, интерактивная карта и умные фильтры поиска.
                </>
              ) : (
                <>
                  IT-Grads объединяет выпускников IT-школ и работодателей.<br/>
                  AI-симулятор собеседований, умный подбор вакансий и прозрачные рейтинги компаний.
                </>
              )}
            </p>

            {/* Stats for logged users */}
            {user && (
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent-cyan/20 rounded-xl">
                    <Users className="h-6 w-6 text-accent-cyan" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-accent-cyan">
                      <AnimatedCounter value={totalUsers} />
                    </div>
                    <div className="text-sm text-gray-400">{t('common.users')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-green-400">
                      <AnimatedCounter value={onlineUsers} />
                    </div>
                    <div className="text-sm text-gray-400">{t('common.onlineNow')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/registration"
                  className="group relative px-8 py-4 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg font-semibold rounded-xl transition-all duration-300 inline-flex items-center shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40"
                >
                  Начать
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/jobs"
                  className="px-8 py-4 bg-dark-surface hover:bg-dark-card border border-dark-card hover:border-accent-cyan/50 text-white font-semibold rounded-xl transition-all duration-300 inline-flex items-center"
                >
                  {t('home.viewVacancies')}
                </Link>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 items-center text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-cyan" />
                <span>{t('home.freeRegistration')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-cyan" />
                <span>{t('home.aiTechnologies')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent-cyan" />
                <span>{t('home.verifiedCompanies')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Для студентов - Cards Grid */}
      {user?.role !== 'employer' && (
        <Section className="bg-dark-surface">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16 scroll-animate-item">
              <h2 className="text-[36px] md:text-[44px] font-bold text-white mb-4">
                {t('home.graduatesTitle')} <span className="text-accent-cyan">{t('home.graduatesTitleHighlight')}</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {t('home.graduatesSubtitle')}
              </p>
            </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {graduateFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group scroll-animate-item"
                style={{ transitionDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card className="h-full p-8 bg-dark-card/50 hover:bg-dark-card border-2 border-dark-card hover:border-accent-cyan/50 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                  {/* Matrix Rain Animation для первой карточки (index === 0) */}
                  {index === 0 && <MatrixRain isActive={hoveredCard === 0} />}

                  {/* AI Scanner Animation для второй карточки (index === 1) */}
                  {index === 1 && <AIScanner isActive={hoveredCard === 1} />}

                  {/* Career Graph Animation для третьей карточки (index === 2) */}
                  {index === 2 && <CareerGraph isActive={hoveredCard === 2} />}

                  {/* Rating Stars Animation для четвертой карточки (index === 3) */}
                  {index === 3 && <RatingStars isActive={hoveredCard === 3} />}

                  <div className="flex items-start gap-6 relative z-10">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-semibold text-white group-hover:text-accent-cyan transition-colors mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-accent-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('common.learnMore')}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

            {!user && (
              <div className="text-center mt-12 scroll-animate-item">
                <Link to="/registration" className="group inline-flex items-center px-8 py-4 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-accent-cyan/25 hover:shadow-accent-cyan/40">
                  {t('home.createGraduateProfile')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Для работодателей - Cards Grid */}
      <Section className={user?.role === 'employer' ? "bg-dark-surface" : "bg-dark-bg"}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 scroll-animate-item">
            <h2 className="text-[36px] md:text-[44px] font-bold text-white mb-4">
              {t('home.employersTitle')} <span className="text-accent-blue">{t('home.employersTitleHighlight')}</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t('home.employersSubtitle')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employerFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group scroll-animate-item"
                style={{ transitionDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredEmployerCard(index)}
                onMouseLeave={() => setHoveredEmployerCard(null)}
              >
                <Card className="h-full p-8 bg-dark-card/50 hover:bg-dark-card border-2 border-dark-card hover:border-accent-blue/50 transition-all duration-300 relative overflow-hidden backdrop-blur-sm">
                  {/* Radar Scan Animation для первой карточки (index === 0) */}
                  {index === 0 && <RadarScan isActive={hoveredEmployerCard === 0} />}

                  {/* Filter Funnel Animation для второй карточки (index === 1) */}
                  {index === 1 && <FilterFunnel isActive={hoveredEmployerCard === 1} />}

                  {/* CheckMarks Animation для третьей карточки (index === 2) */}
                  {index === 2 && <CheckMarks isActive={hoveredEmployerCard === 2} />}

                  {/* Tower Building Animation для четвертой карточки (index === 3) */}
                  {index === 3 && <TowerBuilding isActive={hoveredEmployerCard === 3} />}

                  <div className="flex items-start gap-6 relative z-10">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-semibold text-white group-hover:text-accent-blue transition-colors mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-accent-blue font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('common.learnMore')}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {!user && (
            <div className="text-center mt-12 scroll-animate-item">
              <Link to="/registration" className="group inline-flex items-center px-8 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-accent-blue/25 hover:shadow-accent-blue/40">
                {t('home.registerCompany')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </Section>

      {/* Радар навыков - Showcase */}
      {user?.role !== 'employer' && (
        <Section className="bg-dark-surface">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="scroll-fade-left">
                <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-4">
                  {t('home.skillsRadarTitle')} <span className="text-accent-cyan">{t('home.skillsRadarTitleHighlight')}</span>
                </h2>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  {t('home.skillsRadarDesc')}
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    t('home.skillsRadarFeature1'),
                    t('home.skillsRadarFeature2'),
                    t('home.skillsRadarFeature3'),
                    t('home.skillsRadarFeature4')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-accent-cyan" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>

                <Link to="/skills" className="group inline-flex items-center px-6 py-3 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg font-semibold rounded-xl transition-all duration-300">
                  {t('home.createYourRadar')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Visual */}
              <Link to="/skills" className="block scroll-fade-right">
                <div className="relative rounded-2xl bg-gradient-to-br from-dark-bg to-dark-card p-12 border border-dark-card hover:border-accent-cyan/50 transition-all duration-500 overflow-hidden group">
                  {/* Glowing effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Skills Radar Animation */}
                  <div className="relative h-80">
                    <SkillsRadar isActive={true} />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Section>
      )}

      {/* Final CTA */}
      {!user && (
        <section className="relative py-24 bg-gradient-to-br from-accent-cyan/10 via-accent-blue/10 to-dark-bg border-y border-accent-cyan/20 scroll-scale overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-[32px] md:text-[40px] font-bold mb-6 text-white">
              {t('home.readyToStart')}
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              {t('home.joinThousands')}
            </p>
            <Link to="/registration" className="group inline-flex items-center px-10 py-5 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg font-semibold rounded-xl transition-all duration-300 shadow-xl shadow-accent-cyan/25 hover:shadow-accent-cyan/40 text-lg">
              Создать аккаунт 
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
