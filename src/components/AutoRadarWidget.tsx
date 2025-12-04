import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, TrendingUp, Zap } from 'lucide-react'
import Card from './ui/Card'
import { $api } from '../utils/axios.instance'

interface RadarData {
  radar: Record<string, number>
  completeness: number
  strengths: { skill: string; value: number }[]
  achievements: { id: string; icon: string }[]
  sources: {
    codebattle: { totalSolved: number; rating: number }
    aiInterview: { sessionsCompleted: number }
  }
}

interface AutoRadarWidgetProps {
  userId: number
}

const RADAR_CATEGORIES = [
  { key: 'programming', nameKey: 'autoRadar.categories.programming', color: '#00a8c4' },
  { key: 'algorithms', nameKey: 'autoRadar.categories.algorithms', color: '#00d9ff' },
  { key: 'databases', nameKey: 'autoRadar.categories.databases', color: '#0077a3' },
  { key: 'cloud', nameKey: 'autoRadar.categories.cloud', color: '#00a8c4' },
  { key: 'devops', nameKey: 'autoRadar.categories.devops', color: '#0099cc' },
  { key: 'testing', nameKey: 'autoRadar.categories.testing', color: '#00b8d4' },
  { key: 'networking', nameKey: 'autoRadar.categories.networking', color: '#00a8c4' },
  { key: 'security', nameKey: 'autoRadar.categories.security', color: '#00d9ff' },
  { key: 'ai_ml', nameKey: 'autoRadar.categories.ai', color: '#0077a3' },
  { key: 'data_science', nameKey: 'autoRadar.categories.ai', color: '#00a8c4' },
  { key: 'management', nameKey: 'autoRadar.categories.management', color: '#0099cc' },
  { key: 'ui_ux', nameKey: 'autoRadar.categories.uiux', color: '#00b8d4' },
  { key: 'mobile', nameKey: 'autoRadar.categories.mobile', color: '#00a8c4' },
  { key: 'communication', nameKey: 'autoRadar.categories.communication', color: '#00d9ff' },
]

const AutoRadarWidget: React.FC<AutoRadarWidgetProps> = ({ userId }) => {
  const { t } = useTranslation()
  const [data, setData] = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
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
      const response = await $api.get(`/skills/auto-radar/${userId}`)
      setData(response.data)
    } catch (error) {
      console.error('Error loading radar widget:', error)
    } finally {
      setLoading(false)
    }
  }

  const drawRadar = () => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = Math.min(centerX, centerY) - 20
    const innerRadius = outerRadius * 0.3
    const numCategories = RADAR_CATEGORIES.length
    const angleStep = (2 * Math.PI) / numCategories

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw sectors
    RADAR_CATEGORIES.forEach((category, index) => {
      const value = data.radar[category.key] || 0
      const normalizedValue = Math.max(0.1, value / 100)
      const sectorRadius = innerRadius + (outerRadius - innerRadius) * normalizedValue

      const startAngle = index * angleStep - Math.PI / 2
      const endAngle = (index + 1) * angleStep - Math.PI / 2

      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos((startAngle + endAngle) / 2) * sectorRadius,
        centerY + Math.sin((startAngle + endAngle) / 2) * sectorRadius
      )
      gradient.addColorStop(0, category.color + '40')
      gradient.addColorStop(1, category.color + 'CC')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fill()

      // Border
      ctx.strokeStyle = category.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.stroke()
    })

    // Center
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.strokeStyle = '#00a8c4'
    ctx.lineWidth = 2
    ctx.stroke()

    // Center text
    const avg = Object.values(data.radar).reduce((a, b) => a + b, 0) / Object.keys(data.radar).length
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px "Segoe UI"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(Math.round(avg).toString(), centerX, centerY)
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-cyan"></div>
        </div>
      </Card>
    )
  }

  if (!data) return null

  const avgScore = Math.round(
    Object.values(data.radar).reduce((a, b) => a + b, 0) / Object.keys(data.radar).length
  )

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent-cyan" />
          {t('skills.title')}
        </h4>
        <Link
          to="/skills"
          className="text-accent-cyan hover:text-accent-blue text-sm flex items-center gap-1"
        >
          {t('common.learnMore')}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Mini radar */}
        <canvas
          ref={canvasRef}
          width={150}
          height={150}
          className="flex-shrink-0"
        />

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{t('autoRadar.averageLevel')}</span>
              <span className="text-accent-cyan font-bold">{avgScore}/100</span>
            </div>
            <div className="h-2 bg-dark-card rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue"
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{t('autoRadar.completion')}</span>
              <span className="text-accent-cyan">{data.completeness}%</span>
            </div>
            <div className="h-2 bg-dark-card rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400"
                style={{ width: `${data.completeness}%` }}
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-white font-bold">{data.sources.codebattle.totalSolved}</p>
              <p className="text-gray-500 text-xs">{t('common.tasks')}</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{data.sources.codebattle.rating}</p>
              <p className="text-gray-500 text-xs">{t('common.rating')}</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{data.sources.aiInterview.sessionsCompleted}</p>
              <p className="text-gray-500 text-xs">{t('autoRadar.interviewsPassed')}</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{data.achievements.length}</p>
              <p className="text-gray-500 text-xs">{t('common.achievements')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-card">
          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {t('autoRadar.strengths')}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.strengths.slice(0, 3).map((s) => {
              const cat = RADAR_CATEGORIES.find(c => c.key === s.skill)
              return (
                <span
                  key={s.skill}
                  className="px-2 py-1 rounded text-xs text-white"
                  style={{ backgroundColor: cat?.color + '40' }}
                >
                  {cat ? t(cat.nameKey) : s.skill}: {Math.round(s.value)}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Achievements preview */}
      {data.achievements.length > 0 && (
        <div className="mt-3 flex gap-1">
          {data.achievements.slice(0, 6).map((a) => (
            <span key={a.id} className="text-lg" title={a.id}>
              {a.icon}
            </span>
          ))}
          {data.achievements.length > 6 && (
            <span className="text-gray-500 text-sm">+{data.achievements.length - 6}</span>
          )}
        </div>
      )}
    </Card>
  )
}

export default AutoRadarWidget
