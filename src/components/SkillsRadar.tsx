import React, { useState, useEffect, useRef } from 'react'
import { Save, Edit2, X } from 'lucide-react'
import Card from './ui/Card'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { User } from '../types'
import toast from 'react-hot-toast'

interface Skill {
  category: string
  skill: string
  level: number
}

interface SkillsRadarProps {
  userId?: number
  user?: User | null
  onSave?: (skills: Skill[]) => void
}

// Color palette for categories
const colors = [
  { start: '#00a8c4', end: '#0077a3' },
  { start: '#00d9ff', end: '#00a8c4' },
  { start: '#0077a3', end: '#005a7a' },
  { start: '#00a8c4', end: '#0088a8' },
  { start: '#0099cc', end: '#0077a3' },
  { start: '#00b8d4', end: '#0099cc' },
  { start: '#00a8c4', end: '#0077a3' },
  { start: '#00d9ff', end: '#00a8c4' },
  { start: '#0077a3', end: '#005a7a' },
  { start: '#00a8c4', end: '#0088a8' },
  { start: '#0099cc', end: '#0077a3' },
  { start: '#00b8d4', end: '#0099cc' },
]

const SKILL_CATEGORIES = [
  {
    name: 'Программирование и разработка',
    skills: [
      { name: 'Python', maxLevel: 5 },
      { name: 'Java', maxLevel: 5 },
      { name: 'JavaScript', maxLevel: 5 },
      { name: 'TypeScript', maxLevel: 5 },
      { name: 'C++', maxLevel: 5 },
      { name: 'C#', maxLevel: 5 },
      { name: 'Go', maxLevel: 5 },
      { name: 'React', maxLevel: 5 },
      { name: 'Angular', maxLevel: 5 },
      { name: 'Vue.js', maxLevel: 5 },
      { name: 'Node.js', maxLevel: 5 },
      { name: 'Django', maxLevel: 5 },
      { name: 'Spring', maxLevel: 5 },
      { name: 'SQL', maxLevel: 5 },
    ],
  },
  {
    name: 'Управление базами данных',
    skills: [
      { name: 'MySQL', maxLevel: 5 },
      { name: 'PostgreSQL', maxLevel: 5 },
      { name: 'MongoDB', maxLevel: 5 },
      { name: 'Redis', maxLevel: 5 },
      { name: 'Oracle', maxLevel: 5 },
      { name: 'SQL Server', maxLevel: 5 },
    ],
  },
  {
    name: 'Облачные технологии',
    skills: [
      { name: 'AWS', maxLevel: 5 },
      { name: 'Azure', maxLevel: 5 },
      { name: 'GCP', maxLevel: 5 },
      { name: 'Docker', maxLevel: 5 },
      { name: 'Kubernetes', maxLevel: 5 },
      { name: 'Terraform', maxLevel: 5 },
    ],
  },
  {
    name: 'DevOps и автоматизация',
    skills: [
      { name: 'CI/CD', maxLevel: 5 },
      { name: 'Jenkins', maxLevel: 5 },
      { name: 'GitLab CI', maxLevel: 5 },
      { name: 'GitHub Actions', maxLevel: 5 },
      { name: 'Ansible', maxLevel: 5 },
    ],
  },
  {
    name: 'Тестирование и QA',
    skills: [
      { name: 'Unit Testing', maxLevel: 5 },
      { name: 'Selenium', maxLevel: 5 },
      { name: 'Cypress', maxLevel: 5 },
      { name: 'Postman', maxLevel: 5 },
      { name: 'JUnit', maxLevel: 5 },
    ],
  },
  {
    name: 'Сети и системное администрирование',
    skills: [
      { name: 'Linux', maxLevel: 5 },
      { name: 'TCP/IP', maxLevel: 5 },
      { name: 'DNS', maxLevel: 5 },
      { name: 'VPN', maxLevel: 5 },
      { name: 'Windows Server', maxLevel: 5 },
    ],
  },
  {
    name: 'Информационная безопасность',
    skills: [
      { name: 'Penetration Testing', maxLevel: 5 },
      { name: 'OWASP', maxLevel: 5 },
      { name: 'Криптография', maxLevel: 5 },
      { name: 'Firewall', maxLevel: 5 },
    ],
  },
  {
    name: 'Машинное обучение и AI',
    skills: [
      { name: 'TensorFlow', maxLevel: 5 },
      { name: 'PyTorch', maxLevel: 5 },
      { name: 'NLP', maxLevel: 5 },
      { name: 'Computer Vision', maxLevel: 5 },
      { name: 'scikit-learn', maxLevel: 5 },
    ],
  },
  {
    name: 'Data Science',
    skills: [
      { name: 'Pandas', maxLevel: 5 },
      { name: 'NumPy', maxLevel: 5 },
      { name: 'Tableau', maxLevel: 5 },
      { name: 'Power BI', maxLevel: 5 },
      { name: 'Matplotlib', maxLevel: 5 },
    ],
  },
  {
    name: 'Управление проектами',
    skills: [
      { name: 'Agile', maxLevel: 5 },
      { name: 'Scrum', maxLevel: 5 },
      { name: 'Jira', maxLevel: 5 },
      { name: 'Kanban', maxLevel: 5 },
    ],
  },
  {
    name: 'UI/UX Дизайн',
    skills: [
      { name: 'Figma', maxLevel: 5 },
      { name: 'Sketch', maxLevel: 5 },
      { name: 'Adobe XD', maxLevel: 5 },
    ],
  },
  {
    name: 'Мобильная разработка',
    skills: [
      { name: 'React Native', maxLevel: 5 },
      { name: 'Flutter', maxLevel: 5 },
      { name: 'Swift', maxLevel: 5 },
      { name: 'Kotlin', maxLevel: 5 },
    ],
  },
]

const SkillsRadar = ({ userId, user, onSave }: SkillsRadarProps) => {
  const [skills, setSkills] = useState<Record<string, Record<string, number>>>({})
  const [isEditing, setIsEditing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const actualUserId = userId || user?.id
  useScrollAnimation()

  useEffect(() => {
    if (actualUserId) {
      loadSkills()
    } else {
      initializeDefaultSkills()
    }
  }, [actualUserId])

  useEffect(() => {
    if (canvasRef.current) {
      drawRadar()
    }
  }, [skills])

  const loadSkills = async () => {
    if (actualUserId) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/skills/radar`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const skillsMap: Record<string, Record<string, number>> = {}
          data.forEach((item: Skill & { skill: string }) => {
            if (!skillsMap[item.category]) {
              skillsMap[item.category] = {}
            }
            skillsMap[item.category][item.skill] = item.level
          })
          setSkills(skillsMap)
        }
      } catch (error) {
        console.error('Error loading skills:', error)
        initializeDefaultSkills()
      }
    } else {
      initializeDefaultSkills()
    }
  }

  const initializeDefaultSkills = () => {
    const defaultSkillsMap: Record<string, Record<string, number>> = {}
    SKILL_CATEGORIES.forEach(category => {
      defaultSkillsMap[category.name] = {}
      category.skills.forEach(skill => {
        defaultSkillsMap[category.name][skill.name] = 0
      })
    })
    setSkills(defaultSkillsMap)
  }

  const updateSkill = (category: string, skill: string, level: number) => {
    setSkills(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skill]: level,
      },
    }))
  }

  const getCategoryAverage = (category: string): number => {
    const categorySkills = skills[category] || {}
    const skillValues = Object.values(categorySkills)
    if (skillValues.length === 0) return 0
    return skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length
  }

  const drawRadar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = Math.min(centerX, centerY) - 60
    const innerRadius = outerRadius * 0.3
    const numCategories = SKILL_CATEGORIES.length
    const angleStep = (2 * Math.PI) / numCategories

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background circle
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius + 10, 0, 2 * Math.PI)
    ctx.fill()

    // Draw inner circle (center)
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw category sectors
    SKILL_CATEGORIES.forEach((category, index) => {
      const average = getCategoryAverage(category.name)
      const normalizedValue = Math.max(0.1, average / 5)
      const sectorRadius = innerRadius + (outerRadius - innerRadius) * normalizedValue

      const startAngle = index * angleStep - Math.PI / 2
      const endAngle = (index + 1) * angleStep - Math.PI / 2

      // Create gradient for each sector
      const gradient = ctx.createLinearGradient(
        centerX + Math.cos(startAngle) * innerRadius,
        centerY + Math.sin(startAngle) * innerRadius,
        centerX + Math.cos(startAngle) * sectorRadius,
        centerY + Math.sin(startAngle) * sectorRadius
      )
      const colorIndex = index % colors.length
      gradient.addColorStop(0, colors[colorIndex].start + '80')
      gradient.addColorStop(1, colors[colorIndex].end + 'CC')

      // Draw sector
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fill()

      // Draw sector border
      ctx.strokeStyle = colors[colorIndex].start
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.stroke()

      // Draw inner border
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle)
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
        centerX + sectorRadius * Math.cos(startAngle),
        centerY + sectorRadius * Math.sin(startAngle)
      )
      ctx.stroke()

      // Draw average value inside sector
      if (average > 0) {
        const labelAngle = (startAngle + endAngle) / 2
        ctx.fillStyle = colors[colorIndex].start
        ctx.font = 'bold 14px "Segoe UI"'
        const valueX = centerX + (sectorRadius - 20) * Math.cos(labelAngle)
        const valueY = centerY + (sectorRadius - 20) * Math.sin(labelAngle)
        ctx.fillText(average.toFixed(1), valueX, valueY)
      }
    })

    // Draw center text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px "Segoe UI"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Навыки', centerX, centerY - 10)
    
    const totalAverage = SKILL_CATEGORIES.reduce((sum, cat) => sum + getCategoryAverage(cat.name), 0) / numCategories
    ctx.fillStyle = '#00a8c4'
    ctx.font = '14px "Segoe UI"'
    ctx.fillText(`Средний: ${totalAverage.toFixed(1)}`, centerX, centerY + 15)
  }

  const handleSave = async () => {
    const skillsArray: Skill[] = []
    Object.entries(skills).forEach(([category, categorySkills]) => {
      Object.entries(categorySkills).forEach(([skill, level]) => {
        skillsArray.push({ category, skill, level })
      })
    })

    if (!actualUserId) {
      toast.error('Необходимо войти в систему для сохранения навыков')
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/skills/radar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: actualUserId, skills: skillsArray }),
      })

      if (response.ok) {
        toast.success('Навыки успешно сохранены!')
        setIsEditing(false)
        await loadSkills()
        if (onSave) {
          onSave(skillsArray)
        }
      } else {
        toast.error('Ошибка при сохранении навыков')
      }
    } catch (error) {
      console.error('Error saving skills:', error)
      toast.error('Ошибка при сохранении навыков')
    }
  }

  return (
    <div className="space-y-6 scroll-animate-item">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Интерактивная карта навыков</h3>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Сохранить
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Отмена
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Редактировать
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="max-w-full h-auto"
            />
            {/* Category labels outside circle */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
              {SKILL_CATEGORIES.map((category, index) => {
                const average = getCategoryAverage(category.name)
                const colorIndex = index % colors.length
                return (
                  <div
                    key={category.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-dark-surface"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[colorIndex].start }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base font-semibold truncate">
                        {category.name}
                      </p>
                      <p className="text-accent-cyan text-xs">
                        {average > 0 ? average.toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skills Editor */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {SKILL_CATEGORIES.map((category) => (
              <div key={category.name} className="bg-dark-surface rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">{category.name}</h4>
                <div className="space-y-2">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm flex-1">{skill.name}</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max={skill.maxLevel}
                            value={skills[category.name]?.[skill.name] || 0}
                            onChange={(e) =>
                              updateSkill(category.name, skill.name, parseInt(e.target.value))
                            }
                            className="w-24"
                          />
                          <span className="text-accent-cyan w-8 text-right">
                            {skills[category.name]?.[skill.name] || 0}
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          {[...Array(skill.maxLevel)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded ${
                                i < (skills[category.name]?.[skill.name] || 0)
                                  ? 'bg-accent-cyan'
                                  : 'bg-dark-card'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SkillsRadar

