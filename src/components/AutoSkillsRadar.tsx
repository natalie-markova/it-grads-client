import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, TrendingUp, Award, ChevronDown, ChevronUp, Info, Zap } from 'lucide-react'
import Card from './ui/Card'
import { $api } from '../utils/axios.instance'
import toast from 'react-hot-toast'

interface RadarData {
  radar: Record<string, number>
  breakdown: Record<string, Record<string, number>>
  sources: {
    codebattle: CodeBattleMetrics
    resume: ResumeMetrics
    aiInterview: AIInterviewMetrics
    audioInterview: AudioInterviewMetrics
    roadmap: RoadmapMetrics
    quiz: QuizMetrics
  }
  recommendations: Recommendation[]
  achievements: Achievement[]
  lastCalculatedAt: string
  completeness: number
  strengths: SkillInfo[]
  growthAreas: SkillInfo[]
}

interface CodeBattleMetrics {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  avgSolveTime: number
  rating: number
  league: string
  pvpWinRate: number
  beatAiCount: number
}

interface ResumeMetrics {
  hasPortfolio: boolean
  technologies: string[]
  level: string
  completeness: number
}

interface AIInterviewMetrics {
  sessionsCompleted: number
  avgScore: number
  directions: Record<string, { avgScore: number }>
}

interface AudioInterviewMetrics {
  sessionsCompleted: number
  avgScore: number
  communicationScore: number
  stressResistanceScore: number
}

interface RoadmapMetrics {
  totalStarted: number
  totalCompleted: number
  avgProgress: number
}

interface QuizMetrics {
  totalAnswered: number
  correctRate: number
}

interface Recommendation {
  type: string
  area: string
  title: string
  description: string
  priority: string
  icon: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
}

interface SkillInfo {
  skill: string
  value: number
  level: number
}

interface AutoSkillsRadarProps {
  userId: number
  compact?: boolean
  showSources?: boolean
}

// Категории радара с метаданными
const RADAR_CATEGORIES = [
  { key: 'programming', nameKey: 'autoRadar.categories.programming', icon: '💻', color: '#00a8c4' },
  { key: 'algorithms', nameKey: 'autoRadar.categories.algorithms', icon: '🧮', color: '#00d9ff' },
  { key: 'databases', nameKey: 'autoRadar.categories.databases', icon: '🗄️', color: '#0077a3' },
  { key: 'cloud', nameKey: 'autoRadar.categories.cloud', icon: '☁️', color: '#00a8c4' },
  { key: 'devops', nameKey: 'autoRadar.categories.devops', icon: '🔧', color: '#0099cc' },
  { key: 'testing', nameKey: 'autoRadar.categories.testing', icon: '🧪', color: '#00b8d4' },
  { key: 'networking', nameKey: 'autoRadar.categories.networking', icon: '🌐', color: '#00a8c4' },
  { key: 'security', nameKey: 'autoRadar.categories.security', icon: '🔐', color: '#00d9ff' },
  { key: 'ai_ml', nameKey: 'autoRadar.categories.ai', icon: '🤖', color: '#0077a3' },
  { key: 'data_science', nameKey: 'autoRadar.categories.ai', icon: '📊', color: '#00a8c4' },
  { key: 'management', nameKey: 'autoRadar.categories.management', icon: '📋', color: '#0099cc' },
  { key: 'ui_ux', nameKey: 'autoRadar.categories.uiux', icon: '🎨', color: '#00b8d4' },
  { key: 'mobile', nameKey: 'autoRadar.categories.mobile', icon: '📱', color: '#00a8c4' },
  { key: 'communication', nameKey: 'autoRadar.categories.communication', icon: '💬', color: '#00d9ff' },
]

// Source names keys
const SOURCE_NAME_KEYS: Record<string, string> = {
  codebattle: 'autoRadar.sources.codeBattle',
  resume: 'autoRadar.sources.resume',
  roadmap: 'autoRadar.sources.roadmap',
  interview: 'autoRadar.sources.aiInterview',
  aiInterview: 'autoRadar.sources.aiInterview',
  audioInterview: 'autoRadar.sources.audioInterview',
  quiz: 'autoRadar.sources.practice',
}

const SOURCE_ICONS: Record<string, string> = {
  codebattle: '🎮',
  resume: '📄',
  roadmap: '🗺️',
  interview: '🤖',
  aiInterview: '🤖',
  audioInterview: '🎙️',
  quiz: '❓',
}

const AutoSkillsRadar: React.FC<AutoSkillsRadarProps> = ({
  userId,
  compact = false,
  showSources = true,
}) => {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [showAchievements, setShowAchievements] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadRadar()
  }, [userId])

  useEffect(() => {
    if (data && canvasRef.current) {
      drawRadar()
    }
  }, [data])

  const loadRadar = async () => {
    try {
      setLoading(true)
      const response = await $api.get(`/skills/auto-radar/${userId}`)
      setData(response.data)
    } catch (error) {
      console.error('Error loading auto radar:', error)
      toast.error(t('autoRadar.loadSkillsError'))
    } finally {
      setLoading(false)
    }
  }

  const recalculateRadar = async () => {
    try {
      setRecalculating(true)
      const response = await $api.post('/skills/auto-radar/recalculate')
      setData(prev => prev ? { ...prev, ...response.data } : null)
      toast.success(t('autoRadar.recalculated'))
      await loadRadar()
    } catch (error) {
      console.error('Error recalculating radar:', error)
      toast.error(t('autoRadar.recalculateError'))
    } finally {
      setRecalculating(false)
    }
  }

  const drawRadar = () => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = Math.min(centerX, centerY) - 60
    const innerRadius = outerRadius * 0.25
    const numCategories = RADAR_CATEGORIES.length
    const angleStep = (2 * Math.PI) / numCategories

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background circle with glow
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius + 20)
    bgGradient.addColorStop(0, '#1a1a1a')
    bgGradient.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = bgGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius + 10, 0, 2 * Math.PI)
    ctx.fill()

    // Draw concentric circles (levels)
    for (let level = 1; level <= 5; level++) {
      const levelRadius = innerRadius + (outerRadius - innerRadius) * (level / 5)
      ctx.strokeStyle = level === 5 ? '#2a2a2a' : '#1a1a1a'
      ctx.lineWidth = level === 5 ? 2 : 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, levelRadius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw category sectors
    RADAR_CATEGORIES.forEach((category, index) => {
      const value = data.radar[category.key] || 0
      const normalizedValue = Math.max(0.05, value / 100)
      const sectorRadius = innerRadius + (outerRadius - innerRadius) * normalizedValue

      const startAngle = index * angleStep - Math.PI / 2
      const endAngle = (index + 1) * angleStep - Math.PI / 2
      const midAngle = (startAngle + endAngle) / 2

      // Create gradient
      const gradient = ctx.createLinearGradient(
        centerX + Math.cos(midAngle) * innerRadius,
        centerY + Math.sin(midAngle) * innerRadius,
        centerX + Math.cos(midAngle) * sectorRadius,
        centerY + Math.sin(midAngle) * sectorRadius
      )
      gradient.addColorStop(0, category.color + '40')
      gradient.addColorStop(1, category.color + 'CC')

      // Draw sector
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fill()

      // Draw sector border
      ctx.strokeStyle = category.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.stroke()

      // Draw radial lines
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(
        centerX + innerRadius * Math.cos(startAngle),
        centerY + innerRadius * Math.sin(startAngle)
      )
      ctx.lineTo(
        centerX + outerRadius * Math.cos(startAngle),
        centerY + outerRadius * Math.sin(startAngle)
      )
      ctx.stroke()

      // Draw value inside sector
      if (value > 0) {
        const labelRadius = innerRadius + (sectorRadius - innerRadius) * 0.6
        const labelX = centerX + labelRadius * Math.cos(midAngle)
        const labelY = centerY + labelRadius * Math.sin(midAngle)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px "Segoe UI"'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(Math.round(value).toString(), labelX, labelY)
      }
    })

    // Draw center
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius)
    centerGradient.addColorStop(0, '#1a1a1a')
    centerGradient.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = centerGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.strokeStyle = '#00a8c4'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw center text
    const totalAverage = Object.values(data.radar).reduce((a, b) => a + b, 0) / Object.keys(data.radar).length
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px "Segoe UI"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Уровень', centerX, centerY - 12)
    ctx.fillStyle = '#00a8c4'
    ctx.font = 'bold 24px "Segoe UI"'
    ctx.fillText(Math.round(totalAverage).toString(), centerX, centerY + 12)
  }

  const getSkillLevel = (value: number): string => {
    if (value >= 90) return t('autoRadar.levels.expert')
    if (value >= 70) return t('autoRadar.levels.advanced')
    if (value >= 50) return t('autoRadar.levels.intermediate')
    if (value >= 30) return t('autoRadar.levels.basic')
    if (value >= 10) return t('autoRadar.levels.beginner')
    return t('autoRadar.levels.notDefined')
  }

  const getSkillLevelColor = (value: number): string => {
    if (value >= 90) return 'text-yellow-400'
    if (value >= 70) return 'text-green-400'
    if (value >= 50) return 'text-blue-400'
    if (value >= 30) return 'text-purple-400'
    if (value >= 10) return 'text-gray-400'
    return 'text-gray-600'
  }

  const formatLastCalculated = (dateStr: string): string => {
    if (!dateStr) return t('common.never')
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return t('common.justNow')
    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins })
    if (diffMins < 1440) return t('common.hoursAgo', { count: Math.floor(diffMins / 60) })
    return date.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-400">{t('autoRadar.loadError')}</p>
          <button onClick={loadRadar} className="btn-primary mt-4">
            {t('common.retry')}
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-accent-cyan" />
              {t('autoRadar.title')}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {t('autoRadar.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">
              {t('common.updated')}: {formatLastCalculated(data.lastCalculatedAt)}
            </span>
            <button
              onClick={recalculateRadar}
              disabled={recalculating}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
              {t('common.recalculate')}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{t('autoRadar.profileCompletion')}</span>
            <span className="text-accent-cyan">{data.completeness}%</span>
          </div>
          <div className="h-2 bg-dark-card rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue transition-all duration-500"
              style={{ width: `${data.completeness}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="max-w-full h-auto"
            />
          </div>

          {/* Categories list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {RADAR_CATEGORIES.map((category) => {
              const value = data.radar[category.key] || 0
              const breakdown = data.breakdown[category.key] || {}
              const isExpanded = expandedCategory === category.key

              return (
                <div
                  key={category.key}
                  className="bg-dark-surface rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
                    className="w-full p-3 flex items-center justify-between hover:bg-dark-card transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div className="text-left">
                        <p className="text-white font-medium">{t(category.nameKey)}</p>
                        <p className={`text-sm ${getSkillLevelColor(value)}`}>
                          {getSkillLevel(value)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">{Math.round(value)}</p>
                        <p className="text-gray-500 text-xs">/ 100</p>
                      </div>
                      {showSources && (
                        isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )
                      )}
                    </div>
                  </button>

                  {/* Breakdown */}
                  {showSources && isExpanded && (
                    <div className="px-3 pb-3 border-t border-dark-card">
                      <p className="text-gray-500 text-xs mt-2 mb-2">{t('autoRadar.sourcesLabel')}:</p>
                      <div className="space-y-1">
                        {Object.entries(breakdown)
                          .filter(([_, v]) => v > 0)
                          .map(([source, value]) => (
                            <div
                              key={source}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-400 flex items-center gap-2">
                                <span>{SOURCE_ICONS[source] || '📌'}</span>
                                {SOURCE_NAME_KEYS[source] ? t(SOURCE_NAME_KEYS[source]) : source}
                              </span>
                              <span className="text-accent-cyan">{Math.round(value)}</span>
                            </div>
                          ))}
                        {Object.values(breakdown).every(v => v === 0) && (
                          <p className="text-gray-500 text-sm italic">
                            {t('autoRadar.noData')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="h-1 bg-dark-card">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${value}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Strengths & Growth Areas */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              {t('autoRadar.strengths')}
            </h4>
            {data.strengths.length > 0 ? (
              <div className="space-y-3">
                {data.strengths.map((s) => {
                  const cat = RADAR_CATEGORIES.find(c => c.key === s.skill)
                  return (
                    <div key={s.skill} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat?.icon || '📌'}</span>
                        <span className="text-white">{cat ? t(cat.nameKey) : s.skill}</span>
                      </div>
                      <span className="text-green-400 font-bold">{Math.round(s.value)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {t('autoRadar.startActivity')}
              </p>
            )}
          </Card>

          {/* Growth Areas */}
          <Card>
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-yellow-400" />
              {t('autoRadar.growthAreas')}
            </h4>
            {data.growthAreas.length > 0 ? (
              <div className="space-y-3">
                {data.growthAreas.map((s) => {
                  const cat = RADAR_CATEGORIES.find(c => c.key === s.skill)
                  return (
                    <div key={s.skill} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat?.icon || '📌'}</span>
                        <span className="text-white">{cat ? t(cat.nameKey) : s.skill}</span>
                      </div>
                      <span className="text-yellow-400 font-bold">{Math.round(s.value)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                {t('autoRadar.greatWork')}
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {!compact && data.recommendations.length > 0 && (
        <Card>
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent-cyan" />
              {t('autoRadar.recommendations')}
            </h4>
            {showRecommendations ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showRecommendations && (
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high'
                      ? 'bg-red-900/20 border-red-500'
                      : 'bg-dark-surface border-accent-cyan'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <p className="text-white font-medium">{rec.title}</p>
                      <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Achievements */}
      {!compact && data.achievements.length > 0 && (
        <Card>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Достижения ({data.achievements.length})
            </h4>
            {showAchievements ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showAchievements && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-dark-surface rounded-lg text-center hover:bg-dark-card transition-colors"
                >
                  <span className="text-3xl block mb-2">{achievement.icon}</span>
                  <p className="text-white font-medium text-sm">{achievement.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{achievement.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Data Sources Summary */}
      {!compact && showSources && (
        <Card>
          <h4 className="text-lg font-bold text-white mb-4">{t('autoRadar.dataSources')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Code Battle */}
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <span className="text-2xl block mb-2">🎮</span>
              <p className="text-white font-medium">{t('autoRadar.sources.codeBattle')}</p>
              <p className="text-accent-cyan text-lg font-bold">
                {data.sources.codebattle.totalSolved}
              </p>
              <p className="text-gray-500 text-xs">{t('autoRadar.tasksSolved')}</p>
            </div>

            {/* Resume */}
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <span className="text-2xl block mb-2">📄</span>
              <p className="text-white font-medium">{t('autoRadar.sources.resume')}</p>
              <p className="text-accent-cyan text-lg font-bold">
                {data.sources.resume.completeness}%
              </p>
              <p className="text-gray-500 text-xs">{t('common.filled')}</p>
            </div>

            {/* AI Interview */}
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <span className="text-2xl block mb-2">🤖</span>
              <p className="text-white font-medium">{t('autoRadar.sources.aiInterview')}</p>
              <p className="text-accent-cyan text-lg font-bold">
                {data.sources.aiInterview.sessionsCompleted}
              </p>
              <p className="text-gray-500 text-xs">{t('common.passed')}</p>
            </div>

            {/* Audio Interview */}
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <span className="text-2xl block mb-2">🎙️</span>
              <p className="text-white font-medium">{t('autoRadar.sources.audioInterview')}</p>
              <p className="text-accent-cyan text-lg font-bold">
                {data.sources.audioInterview.sessionsCompleted}
              </p>
              <p className="text-gray-500 text-xs">{t('common.passed')}</p>
            </div>

            {/* Roadmap */}
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <span className="text-2xl block mb-2">🗺️</span>
              <p className="text-white font-medium">{t('autoRadar.sources.roadmap')}</p>
              <p className="text-accent-cyan text-lg font-bold">
                {data.sources.roadmap.avgProgress}%
              </p>
              <p className="text-gray-500 text-xs">{t('common.averageProgress')}</p>
            </div>

            {/* Rating */}
            <div className="bg-dark-surface rounded-lg p-4 text-center">
              <span className="text-2xl block mb-2">🏆</span>
              <p className="text-white font-medium">{t('common.rating')}</p>
              <p className="text-accent-cyan text-lg font-bold">
                {data.sources.codebattle.rating}
              </p>
              <p className="text-gray-500 text-xs">{data.sources.codebattle.league}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AutoSkillsRadar
