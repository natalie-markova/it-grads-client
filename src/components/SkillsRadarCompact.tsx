import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, BarChart3, Target, TrendingUp } from 'lucide-react'
import Card from './ui/Card'
import { User } from '../types'
import toast from 'react-hot-toast'
import { $api } from '../utils/axios.instance'
import { useTranslation } from 'react-i18next'

interface Skill {
  category: string
  skill: string
  level: number
}

interface SkillsRadarCompactProps {
  userId?: number
  user?: User | null
  onSave?: (skills: Skill[]) => void
}

const colors = [
  '#00d9ff', '#00a8c4', '#0077a3', '#00b8d4', '#0099cc', '#00c4a7',
  '#00d9a7', '#00e4c4', '#00c4d9', '#0088a8', '#00a8e4', '#00b8ff'
]

const SKILL_CATEGORIES = [
  {
    name: 'Программирование',
    key: 'programming',
    short: 'DEV',
    skills: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring', 'SQL'],
  },
  {
    name: 'Базы данных',
    key: 'databases',
    short: 'DB',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server'],
  },
  {
    name: 'Облачные технологии',
    key: 'cloud',
    short: 'CLOUD',
    skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
  },
  {
    name: 'DevOps',
    key: 'devops',
    short: 'OPS',
    skills: ['CI/CD', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Ansible'],
  },
  {
    name: 'Тестирование',
    key: 'testing',
    short: 'QA',
    skills: ['Unit Testing', 'Selenium', 'Cypress', 'Postman', 'JUnit'],
  },
  {
    name: 'Сети и админ',
    key: 'network',
    short: 'NET',
    skills: ['Linux', 'TCP/IP', 'DNS', 'VPN', 'Windows Server'],
  },
  {
    name: 'Безопасность',
    key: 'security',
    short: 'SEC',
    skills: ['Penetration Testing', 'OWASP', 'Криптография', 'Firewall'],
  },
  {
    name: 'ML & AI',
    key: 'ai',
    short: 'AI',
    skills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'scikit-learn'],
  },
  {
    name: 'Data Science',
    key: 'data',
    short: 'DATA',
    skills: ['Pandas', 'NumPy', 'Tableau', 'Power BI', 'Matplotlib'],
  },
  {
    name: 'Управление',
    key: 'management',
    short: 'PM',
    skills: ['Agile', 'Scrum', 'Jira', 'Kanban'],
  },
  {
    name: 'UI/UX',
    key: 'uiux',
    short: 'UX',
    skills: ['Figma', 'Sketch', 'Adobe XD'],
  },
  {
    name: 'Мобильная разработка',
    key: 'mobileDev',
    short: 'MOB',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  },
]

const SkillsRadarCompact = ({ userId, user, onSave }: SkillsRadarCompactProps) => {
  const { t } = useTranslation()
  const [skills, setSkills] = useState<Record<string, Record<string, number>>>({})

  // Function to get translated category name
  const getCategoryName = (category: typeof SKILL_CATEGORIES[0]) => {
    return t(`skills.categories.${category.key}`, category.name)
  }
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const actualUserId = userId || user?.id

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
        const response = await $api.get(`/skills/radar/${actualUserId}`)
        const data = response.data

        const skillsMap: Record<string, Record<string, number>> = {}
        SKILL_CATEGORIES.forEach(category => {
          skillsMap[category.name] = {}
          category.skills.forEach(skill => {
            skillsMap[category.name][skill] = 0
          })
        })

        const skillsData = data.skillsWithLevels || data.skills

        if (Array.isArray(skillsData) && skillsData.length > 0) {
          if (typeof skillsData[0] === 'object' && skillsData[0].level !== undefined) {
            skillsData.forEach((item: Skill) => {
              if (skillsMap[item.category] && item.skill in skillsMap[item.category]) {
                skillsMap[item.category][item.skill] = item.level
              }
            })
          } else {
            skillsData.forEach((skillName: string) => {
              SKILL_CATEGORIES.forEach(category => {
                if (category.skills.includes(skillName)) {
                  skillsMap[category.name][skillName] = 3
              })
            })
          }
        }

        setSkills(skillsMap)
      } catch (error) {
        console.error('Error loading skills:', error)
        initializeDefaultSkills()
      }
    }
  }

  const initializeDefaultSkills = () => {
    const defaultSkillsMap: Record<string, Record<string, number>> = {}
    SKILL_CATEGORIES.forEach(category => {
      defaultSkillsMap[category.name] = {}
      category.skills.forEach(skill => {
        defaultSkillsMap[category.name][skill] = 0
      })
    })
    setSkills(defaultSkillsMap)
  }

  const getCategoryAverage = (categoryName: string): number => {
    const categorySkills = skills[categoryName] || {}
    const skillValues = Object.values(categorySkills)
    if (skillValues.length === 0) return 0
    return skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length
  }

  const getTotalAverage = (): number => {
    const averages = SKILL_CATEGORIES.map(cat => getCategoryAverage(cat.name))
    return averages.reduce((sum, val) => sum + val, 0) / averages.length
  }

  const getFilledSkillsCount = (): number => {
    let count = 0
    Object.values(skills).forEach(categorySkills => {
      Object.values(categorySkills).forEach(level => {
        if (level > 0) count++
      })
    })
    return count
  }

  const getTotalSkillsCount = (): number => {
    return SKILL_CATEGORIES.reduce((sum, cat) => sum + cat.skills.length, 0)
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

  const drawRadar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 300
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const outerRadius = size / 2 - 40
    const innerRadius = outerRadius * 0.25
    const numCategories = SKILL_CATEGORIES.length
    const angleStep = (2 * Math.PI) / numCategories

    ctx.clearRect(0, 0, size, size)

    // Draw background
    ctx.fillStyle = '#0f0f0f'
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius + 5, 0, 2 * Math.PI)
    ctx.fill()

    // Draw grid circles
    for (let i = 1; i <= 5; i++) {
      const r = innerRadius + (outerRadius - innerRadius) * (i / 5)
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw sectors
    SKILL_CATEGORIES.forEach((category, index) => {
      const average = getCategoryAverage(category.name)
      const normalizedValue = Math.max(0.05, average / 5)
      const sectorRadius = innerRadius + (outerRadius - innerRadius) * normalizedValue

      const startAngle = index * angleStep - Math.PI / 2
      const endAngle = (index + 1) * angleStep - Math.PI / 2

      // Draw filled sector
      const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, sectorRadius)
      gradient.addColorStop(0, colors[index] + '40')
      gradient.addColorStop(1, colors[index] + '90')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()

      // Draw sector border
      ctx.strokeStyle = colors[index]
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, sectorRadius, startAngle, endAngle)
      ctx.stroke()

      // Draw radial lines
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + outerRadius * Math.cos(startAngle),
        centerY + outerRadius * Math.sin(startAngle)
      )
      ctx.stroke()

      // Draw category short label
      const labelAngle = (startAngle + endAngle) / 2
      const labelRadius = outerRadius + 20
      const labelX = centerX + labelRadius * Math.cos(labelAngle)
      const labelY = centerY + labelRadius * Math.sin(labelAngle)

      ctx.fillStyle = colors[index]
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(category.short, labelX, labelY)
    })

    // Draw center
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw center score
    const totalAvg = getTotalAverage()
    ctx.fillStyle = '#00d9ff'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(totalAvg.toFixed(1), centerX, centerY)
  }

  const handleSave = async () => {
    if (!actualUserId) {
      toast.error(t('skills.authRequired'))
      return
    }

    setIsSaving(true)
    const skillsArray: Skill[] = []
    Object.entries(skills).forEach(([category, categorySkills]) => {
      Object.entries(categorySkills).forEach(([skill, level]) => {
        skillsArray.push({ category, skill, level })
      })
    })

    try {
      const canvas = canvasRef.current
      let radarImage = ''
      if (canvas) {
        radarImage = canvas.toDataURL('image/png')
      }

      await $api.post('/skills/radar', {
        userId: actualUserId,
        skills: skillsArray,
        radarImage
      })

      toast.success(t('skills.skillsSaved'))
      setIsEditing(false)
      if (onSave) onSave(skillsArray)
    } catch (error) {
      console.error('Error saving skills:', error)
      toast.error(t('skills.errorSaving'))
    } finally {
      setIsSaving(false)
    }
  }

  const getSkillLevelColor = (level: number) => {
    if (level === 0) return 'bg-gray-700'
    if (level <= 2) return 'bg-red-500'
    if (level <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getSkillLevelText = (level: number) => {
    if (level === 0) return t('skills.notSpecified')
    if (level === 1) return t('skills.beginner')
    if (level === 2) return t('skills.basic')
    if (level === 3) return t('skills.intermediate')
    if (level === 4) return t('skills.advanced')
    return t('skills.expert')
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-5 w-5 text-accent-cyan" />
            <span className="text-gray-400 text-sm">{t('skills.averageLevel')}</span>
          </div>
          <div className="text-3xl font-bold text-white">{getTotalAverage().toFixed(1)}</div>
          <div className="text-xs text-gray-500">{t('skills.outOf')} 5.0</div>
        </Card>
        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-green-400" />
            <span className="text-gray-400 text-sm">{t('skills.filled')}</span>
          </div>
          <div className="text-3xl font-bold text-white">{getFilledSkillsCount()}</div>
          <div className="text-xs text-gray-500">{t('skills.outOf')} {getTotalSkillsCount()} {t('skills.ofSkills')}</div>
        </Card>
        <Card className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            <span className="text-gray-400 text-sm">{t('skills.progress')}</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {Math.round((getFilledSkillsCount() / getTotalSkillsCount()) * 100)}%
          </div>
          <div className="text-xs text-gray-500">{t('skills.completion')}</div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">{t('skills.skillsMap')}</h3>
          </div>
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
          {/* Legend */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
            {SKILL_CATEGORIES.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index] }}
                />
                <span className="text-gray-400 font-medium">{cat.short}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills List */}
        <Card className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">{t('skills.skillsDetail')}</h3>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-accent-cyan text-dark-bg rounded-lg text-sm font-medium hover:bg-accent-cyan/90 disabled:opacity-50"
                >
                  {isSaving ? t('skills.saving') : t('skills.save')}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-dark-surface text-gray-300 rounded-lg text-sm hover:bg-dark-card"
                >
                  {t('common.cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-dark-surface text-gray-300 rounded-lg text-sm hover:bg-dark-card"
              >
                {t('skills.edit')}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {SKILL_CATEGORIES.map((category, catIndex) => {
              const average = getCategoryAverage(category.name)
              const isExpanded = expandedCategory === category.name

              return (
                <div key={category.name} className="border border-dark-card rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                    className="w-full flex items-center justify-between p-3 bg-dark-surface hover:bg-dark-card transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[catIndex] }}
                      />
                      <span className="text-white font-medium">{getCategoryName(category)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-dark-bg rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(average / 5) * 100}%`,
                              backgroundColor: colors[catIndex]
                            }}
                          />
                        </div>
                        <span className="text-accent-cyan text-sm font-medium w-8">
                          {average.toFixed(1)}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-dark-bg space-y-2">
                      {category.skills.map(skillName => {
                        const level = skills[category.name]?.[skillName] || 0
                        return (
                          <div key={skillName} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">{skillName}</span>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="5"
                                  value={level}
                                  onChange={(e) => updateSkill(category.name, skillName, parseInt(e.target.value))}
                                  className="w-20 h-1 bg-dark-card rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                                />
                                <span className="text-accent-cyan text-sm w-4">{level}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-sm ${i <= level ? getSkillLevelColor(level) : 'bg-dark-card'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-gray-500 text-xs w-20 text-right">
                                  {getSkillLevelText(level)}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Top Skills Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">{t('skills.topSkills')}</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(skills)
            .flatMap(([category, categorySkills]) =>
              Object.entries(categorySkills)
                .filter(([, level]) => level >= 4)
                .map(([skill, level]) => ({ skill, level, category }))
            )
            .sort((a, b) => b.level - a.level)
            .slice(0, 12)
            .map(({ skill, level }) => (
              <span
                key={skill}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  level === 5
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                }`}
              >
                {skill} ({level})
              </span>
            ))
          }
          {Object.entries(skills)
            .flatMap(([, categorySkills]) =>
              Object.entries(categorySkills).filter(([, level]) => level >= 4)
            ).length === 0 && (
            <p className="text-gray-500 text-sm">
              {t('skills.addSkillsHint')}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SkillsRadarCompact
