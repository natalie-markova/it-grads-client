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

// Описания категорий для тултипов
const CATEGORY_DESCRIPTIONS: Record<string, { descKey: string; sourcesKeys: string[] }> = {
  programming: {
    descKey: 'autoRadar.tooltips.programming',
    sourcesKeys: ['codebattle', 'resume', 'aiInterview']
  },
  algorithms: {
    descKey: 'autoRadar.tooltips.algorithms',
    sourcesKeys: ['codebattle', 'quiz']
  },
  databases: {
    descKey: 'autoRadar.tooltips.databases',
    sourcesKeys: ['resume', 'aiInterview', 'roadmap']
  },
  cloud: {
    descKey: 'autoRadar.tooltips.cloud',
    sourcesKeys: ['resume', 'roadmap']
  },
  devops: {
    descKey: 'autoRadar.tooltips.devops',
    sourcesKeys: ['resume', 'roadmap', 'aiInterview']
  },
  testing: {
    descKey: 'autoRadar.tooltips.testing',
    sourcesKeys: ['codebattle', 'resume', 'roadmap']
  },
  networking: {
    descKey: 'autoRadar.tooltips.networking',
    sourcesKeys: ['resume', 'roadmap']
  },
  security: {
    descKey: 'autoRadar.tooltips.security',
    sourcesKeys: ['resume', 'roadmap', 'aiInterview']
  },
  ai_ml: {
    descKey: 'autoRadar.tooltips.ai',
    sourcesKeys: ['resume', 'roadmap', 'aiInterview']
  },
  data_science: {
    descKey: 'autoRadar.tooltips.dataScience',
    sourcesKeys: ['resume', 'roadmap']
  },
  management: {
    descKey: 'autoRadar.tooltips.management',
    sourcesKeys: ['resume', 'audioInterview']
  },
  ui_ux: {
    descKey: 'autoRadar.tooltips.uiux',
    sourcesKeys: ['resume', 'roadmap']
  },
  mobile: {
    descKey: 'autoRadar.tooltips.mobile',
    sourcesKeys: ['resume', 'roadmap', 'aiInterview']
  },
  communication: {
    descKey: 'autoRadar.tooltips.communication',
    sourcesKeys: ['audioInterview']
  },
}

interface TooltipData {
  x: number
  y: number
  category: string | null
  isCenter: boolean
  sectorX: number // Координата центра сектора на canvas
  sectorY: number
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
  const [expandedSource, setExpandedSource] = useState<string | null>(null) // category:source
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [showAchievements, setShowAchievements] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    ctx.fillText(t('autoRadar.level'), centerX, centerY - 12)
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
    return '' // Не показываем "не определён"
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

  // Получить детали источника для категории с расчётом баллов
  const getSourceDetails = (source: string, category: string, sourcePoints: number) => {
    if (!data) return null

    const details: { label: string; value: string | number; points?: number }[] = []

    switch (source) {
      case 'codebattle':
        const cb = data.sources.codebattle
        if (cb.totalSolved > 0) {
          details.push({ label: t('autoRadar.sourceDetails.solved'), value: cb.totalSolved, points: Math.round(sourcePoints * 0.4) })
        }
        if (cb.easySolved > 0) {
          details.push({ label: `  • ${t('autoRadar.sourceDetails.easy')}`, value: cb.easySolved, points: cb.easySolved * 2 })
        }
        if (cb.mediumSolved > 0) {
          details.push({ label: `  • ${t('autoRadar.sourceDetails.medium')}`, value: cb.mediumSolved, points: cb.mediumSolved * 5 })
        }
        if (cb.hardSolved > 0) {
          details.push({ label: `  • ${t('autoRadar.sourceDetails.hard')}`, value: cb.hardSolved, points: cb.hardSolved * 10 })
        }
        if (cb.rating > 0) {
          details.push({ label: t('autoRadar.sourceDetails.rating'), value: cb.rating, points: Math.round(sourcePoints * 0.3) })
        }
        break
      case 'resume':
        const res = data.sources.resume
        if (res.completeness > 0) {
          details.push({ label: t('autoRadar.sourceDetails.completeness'), value: `${res.completeness}%`, points: Math.round(res.completeness * 0.3) })
        }
        if (res.technologies.length > 0) {
          details.push({ label: t('autoRadar.sourceDetails.technologies'), value: res.technologies.length, points: res.technologies.length * 2 })
        }
        if (res.level) {
          details.push({ label: t('autoRadar.sourceDetails.level'), value: res.level })
        }
        break
      case 'aiInterview':
        const ai = data.sources.aiInterview
        if (ai.sessionsCompleted > 0) {
          details.push({ label: t('autoRadar.sourceDetails.sessions'), value: ai.sessionsCompleted, points: ai.sessionsCompleted * 5 })
        }
        if (ai.avgScore > 0) {
          details.push({ label: t('autoRadar.sourceDetails.avgScore'), value: `${Math.round(ai.avgScore)}%`, points: Math.round(ai.avgScore * 0.5) })
        }
        break
      case 'audioInterview':
        const audio = data.sources.audioInterview
        if (audio.sessionsCompleted > 0) {
          details.push({ label: t('autoRadar.sourceDetails.sessions'), value: audio.sessionsCompleted, points: audio.sessionsCompleted * 5 })
        }
        if (audio.avgScore > 0) {
          details.push({ label: t('autoRadar.sourceDetails.avgScore'), value: `${Math.round(audio.avgScore)}%`, points: Math.round(audio.avgScore * 0.3) })
        }
        if (audio.communicationScore > 0) {
          details.push({ label: t('autoRadar.sourceDetails.communication'), value: `${Math.round(audio.communicationScore)}%`, points: Math.round(audio.communicationScore * 0.2) })
        }
        break
      case 'roadmap':
        const rm = data.sources.roadmap
        if (rm.totalStarted > 0) {
          details.push({ label: t('autoRadar.sourceDetails.started'), value: rm.totalStarted, points: rm.totalStarted * 3 })
        }
        if (rm.totalCompleted > 0) {
          details.push({ label: t('autoRadar.sourceDetails.completed'), value: rm.totalCompleted, points: rm.totalCompleted * 10 })
        }
        if (rm.avgProgress > 0) {
          details.push({ label: t('autoRadar.sourceDetails.avgProgress'), value: `${rm.avgProgress}%`, points: Math.round(rm.avgProgress * 0.3) })
        }
        break
      case 'quiz':
        const q = data.sources.quiz
        if (q.totalAnswered > 0) {
          details.push({ label: t('autoRadar.sourceDetails.answered'), value: q.totalAnswered, points: Math.round(q.totalAnswered * 0.5) })
        }
        if (q.correctRate > 0) {
          details.push({ label: t('autoRadar.sourceDetails.correctRate'), value: `${Math.round(q.correctRate)}%`, points: Math.round(q.correctRate * 0.3) })
        }
        break
    }

    return details
  }

  // Обработчик движения мыши по canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = Math.min(centerX, centerY) - 60
    const innerRadius = outerRadius * 0.25

    // Расстояние от центра
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Координаты относительно canvas (в пикселях canvas, потом переведём в проценты для позиционирования)
    const canvasDisplayWidth = rect.width
    const canvasDisplayHeight = rect.height

    // Проверяем центр
    if (distance <= innerRadius) {
      // Координаты центра относительно canvas контейнера
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        category: null,
        isCenter: true,
        sectorX: canvasDisplayWidth / 2, // относительно canvas
        sectorY: canvasDisplayHeight / 2
      })
      return
    }

    // Проверяем секторы
    if (distance <= outerRadius) {
      let angle = Math.atan2(dy, dx) + Math.PI / 2
      if (angle < 0) angle += 2 * Math.PI

      const numCategories = RADAR_CATEGORIES.length
      const angleStep = (2 * Math.PI) / numCategories
      const categoryIndex = Math.floor(angle / angleStep)

      if (categoryIndex >= 0 && categoryIndex < numCategories) {
        // Вычисляем центр сектора
        const midAngle = (categoryIndex + 0.5) * angleStep - Math.PI / 2
        const value = data.radar[RADAR_CATEGORIES[categoryIndex].key] || 0
        const normalizedValue = Math.max(0.1, value / 100)
        const sectorRadius = innerRadius + (outerRadius - innerRadius) * normalizedValue * 0.7

        // Координаты относительно canvas контейнера (не экрана!)
        const screenScale = rect.width / canvas.width
        const localCenterX = canvasDisplayWidth / 2
        const localCenterY = canvasDisplayHeight / 2
        const sectorLocalX = localCenterX + Math.cos(midAngle) * sectorRadius * screenScale
        const sectorLocalY = localCenterY + Math.sin(midAngle) * sectorRadius * screenScale

        setTooltip({
          x: e.clientX,
          y: e.clientY,
          category: RADAR_CATEGORIES[categoryIndex].key,
          isCenter: false,
          sectorX: sectorLocalX,
          sectorY: sectorLocalY
        })
        return
      }
    }

    setTooltip(null)
  }

  const handleCanvasMouseLeave = () => {
    setTooltip(null)
  }

  // Получить данные для тултипа
  const getTooltipContent = () => {
    if (!tooltip || !data) return null

    if (tooltip.isCenter) {
      // Тултип для центра - общий уровень
      const totalAverage = Object.values(data.radar).reduce((a, b) => a + b, 0) / Object.keys(data.radar).length
      const activeCategories = Object.entries(data.radar).filter(([_, v]) => v > 0)

      return {
        title: t('autoRadar.tooltip.overallLevel'),
        value: Math.round(totalAverage),
        description: t('autoRadar.tooltip.overallDesc'),
        sources: [
          { icon: '🎮', name: t('autoRadar.sources.codeBattle'), value: data.sources.codebattle.totalSolved, unit: t('autoRadar.tasksSolved') },
          { icon: '🤖', name: t('autoRadar.sources.aiInterview'), value: data.sources.aiInterview.sessionsCompleted, unit: t('common.sessions') },
          { icon: '🎙️', name: t('autoRadar.sources.audioInterview'), value: data.sources.audioInterview.sessionsCompleted, unit: t('common.sessions') },
          { icon: '🗺️', name: t('autoRadar.sources.roadmap'), value: `${data.sources.roadmap.avgProgress}%`, unit: t('common.progress') },
          { icon: '📄', name: t('autoRadar.sources.resume'), value: `${data.sources.resume.completeness}%`, unit: t('common.filled') },
        ].filter(s => s.value !== 0 && s.value !== '0%'),
        stats: [
          { label: t('autoRadar.tooltip.activeCategories'), value: activeCategories.length },
          { label: t('autoRadar.tooltip.profileCompleteness'), value: `${data.completeness}%` },
        ]
      }
    }

    if (tooltip.category) {
      const category = RADAR_CATEGORIES.find(c => c.key === tooltip.category)
      const categoryDesc = CATEGORY_DESCRIPTIONS[tooltip.category]
      const value = data.radar[tooltip.category] || 0
      const breakdown = data.breakdown[tooltip.category] || {}

      const sources = Object.entries(breakdown)
        .filter(([_, v]) => v > 0)
        .map(([source, value]) => ({
          icon: SOURCE_ICONS[source] || '📌',
          name: SOURCE_NAME_KEYS[source] ? t(SOURCE_NAME_KEYS[source]) : source,
          value: Math.round(value),
          unit: t('autoRadar.tooltip.points')
        }))

      return {
        title: category ? t(category.nameKey) : tooltip.category,
        icon: category?.icon,
        value: Math.round(value),
        level: getSkillLevel(value),
        description: categoryDesc ? t(categoryDesc.descKey) : '',
        sources,
        expectedSources: categoryDesc?.sourcesKeys.map(key => ({
          icon: SOURCE_ICONS[key] || '📌',
          name: SOURCE_NAME_KEYS[key] ? t(SOURCE_NAME_KEYS[key]) : key
        })) || []
      }
    }

    return null
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
          <div className="flex flex-col items-center relative" ref={containerRef}>
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="max-w-full h-auto cursor-pointer"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
            />

            {/* Tooltip прямо над секцией - absolute относительно контейнера радара */}
            {tooltip && (() => {
              const content = getTooltipContent()
              if (!content) return null

              // Получаем цвет категории
              const categoryColor = tooltip.category
                ? RADAR_CATEGORIES.find(c => c.key === tooltip.category)?.color || '#00a8c4'
                : '#00a8c4'

              // Тултип над точкой, позиционирование относительно контейнера
              const tooltipWidth = 220

              return (
                <div
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left: Math.max(0, tooltip.sectorX - tooltipWidth / 2),
                    top: tooltip.sectorY - 10,
                    width: tooltipWidth,
                    transform: 'translateY(-100%)',
                  }}
                >
                    <div
                      className="bg-dark-card/95 backdrop-blur-sm border rounded-lg p-2.5 shadow-xl"
                      style={{ borderColor: categoryColor + '80' }}
                    >
                      {/* Header компактный */}
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-700/50">
                        {'icon' in content && content.icon && (
                          <span className="text-base">{content.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-xs truncate">{content.title}</h4>
                          {'level' in content && content.level && (
                            <p className={`text-[10px] ${getSkillLevelColor(content.value)}`}>
                              {content.level}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-bold" style={{ color: categoryColor }}>{content.value}</span>
                          <span className="text-gray-500 text-[10px]">/100</span>
                        </div>
                      </div>

                      {/* Description */}
                      {content.description && (
                        <p className="text-gray-400 text-[10px] mb-1.5 line-clamp-2">{content.description}</p>
                      )}

                      {/* Sources компактно */}
                      {content.sources && content.sources.length > 0 && (
                        <div className="space-y-px">
                          {content.sources.slice(0, 3).map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-400 flex items-center gap-0.5">
                                <span>{source.icon}</span>
                                {source.name}
                              </span>
                              <span style={{ color: categoryColor }} className="font-medium">
                                {source.value}
                              </span>
                            </div>
                          ))}
                          {content.sources.length > 3 && (
                            <p className="text-gray-500 text-[10px]">+{content.sources.length - 3} {t('common.more').toLowerCase()}...</p>
                          )}
                        </div>
                      )}

                      {/* Expected sources */}
                      {'expectedSources' in content && content.sources?.length === 0 && content.expectedSources && content.expectedSources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {content.expectedSources.slice(0, 3).map((source, idx) => (
                            <span key={idx} className="text-gray-500 text-xs">
                              {source.icon}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats для центра */}
                      {'stats' in content && content.stats && (
                        <div className="flex justify-around pt-1.5 border-t border-gray-700/50 mt-1.5">
                          {content.stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                              <p style={{ color: categoryColor }} className="font-bold text-xs">{stat.value}</p>
                              <p className="text-gray-500 text-[10px]">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
            })()}
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
                        {getSkillLevel(value) && (
                          <p className={`text-sm ${getSkillLevelColor(value)}`}>
                            {getSkillLevel(value)}
                          </p>
                        )}
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
                          .map(([source, sourceValue]) => {
                            const sourceKey = `${category.key}:${source}`
                            const isSourceExpanded = expandedSource === sourceKey
                            const details = getSourceDetails(source, category.key, sourceValue)

                            return (
                              <div key={source}>
                                <button
                                  onClick={() => setExpandedSource(isSourceExpanded ? null : sourceKey)}
                                  className="w-full flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-dark-card/50 transition-colors"
                                >
                                  <span className="text-gray-400 flex items-center gap-2">
                                    <span>{SOURCE_ICONS[source] || '📌'}</span>
                                    {SOURCE_NAME_KEYS[source] ? t(SOURCE_NAME_KEYS[source]) : source}
                                    {details && details.length > 0 && (
                                      <ChevronDown className={`h-3 w-3 transition-transform ${isSourceExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                  </span>
                                  <span className="text-accent-cyan font-medium">+{Math.round(sourceValue)} {t('autoRadar.tooltip.points')}</span>
                                </button>

                                {/* Детали источника с баллами */}
                                {isSourceExpanded && details && details.length > 0 && (
                                  <div className="ml-6 mt-1 mb-2 p-2 bg-dark-card/50 rounded-lg space-y-1.5 border-l-2 border-accent-cyan/30">
                                    {details.map((detail, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">{detail.label}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-300">{detail.value}</span>
                                          {detail.points !== undefined && (
                                            <span className="text-accent-cyan text-[10px]">+{detail.points}</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
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
              {t('autoRadar.achievementsTitle', { count: data.achievements.length })}
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
