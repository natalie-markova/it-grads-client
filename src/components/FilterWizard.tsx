import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Check, Search } from 'lucide-react'
import Card from './ui/Card'

export interface FilterData {
  employmentType: string[]
  workFormat: string[]
  region: string
  experience: string
  salary: string
  salaryUnlimited: boolean
  technology: string[]
  programmingLanguages: string[]
  additionalSkills: string[]
  additionalSkillsCustom: string
  englishLevel: string
  companySize: string
  industry: string
}

interface FilterWizardProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterData) => void
  initialFilters?: FilterData
}

const FilterWizard = ({ isOpen, onClose, onApply, initialFilters }: FilterWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [customSkillInput, setCustomSkillInput] = useState('')

  // Блокируем скролл body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])
  
  const [filters, setFilters] = useState<FilterData>(initialFilters || {
    employmentType: [],
    workFormat: [],
    region: '',
    experience: '',
    salary: '',
    salaryUnlimited: false,
    technology: [],
    programmingLanguages: [],
    additionalSkills: [],
    additionalSkillsCustom: '',
    englishLevel: '',
    companySize: '',
    industry: '',
  })

  const steps = [
    { id: 0, title: 'Тип занятости и формат работы' },
    { id: 1, title: 'Опыт работы' },
    { id: 2, title: 'Регион/Город и знание языка' },
    { id: 3, title: 'Диапазон зарплаты' },
    { id: 4, title: 'Отрасль бизнеса работодателя' },
    { id: 5, title: 'Языки программирования' },
    { id: 6, title: 'Технологическое направление' },
    { id: 7, title: 'Дополнительные навыки' },
  ]

  const toggleFilter = (category: keyof FilterData, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category] as string[]
      if (Array.isArray(currentValues)) {
        return {
          ...prev,
          [category]: currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        }
      } else {
        return {
          ...prev,
          [category]: prev[category] === value ? '' : value
        }
      }
    })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleSearch = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      employmentType: [],
      workFormat: [],
      region: '',
      experience: '',
      salary: '',
      salaryUnlimited: false,
      technology: [],
      programmingLanguages: [],
      additionalSkills: [],
      additionalSkillsCustom: '',
      englishLevel: '',
      companySize: '',
      industry: '',
    })
  }

  useEffect(() => {
    if (isOpen) {
      if (initialFilters) {
        // Если initialFilters имеет старую структуру, конвертируем в новую
        const convertedFilters: FilterData = {
          ...initialFilters,
          salary: initialFilters.salary || (initialFilters as any).salaryMin || '',
          additionalSkillsCustom: initialFilters.additionalSkillsCustom || '',
        }
        // Удаляем старые поля если они есть
        if ((initialFilters as any).salaryMin) {
          delete (convertedFilters as any).salaryMin
          delete (convertedFilters as any).salaryMax
        }
        setFilters(convertedFilters)
      }
      setCurrentStep(0)
      setCustomSkillInput('')
    }
  }, [isOpen, initialFilters])

  if (!isOpen) return null

  const employmentTypes = [
    { value: 'full-time', label: 'Полная занятость' },
    { value: 'part-time', label: 'Частичная занятость' },
    { value: 'remote', label: 'Удалённая работа' },
    { value: 'freelance', label: 'Проектная работа / Фриланс' },
    { value: 'internship', label: 'Стажёрство / Практика' },
  ]

  const workFormats = [
    { value: 'office', label: 'Офисная работа' },
    { value: 'hybrid', label: 'Гибридная работа' },
    { value: 'remote', label: 'Удалённо (WFH)' },
  ]

  const experienceLevels = [
    { value: 'no-experience', label: 'Нет опыта' },
    { value: 'junior', label: 'Junior (до 2-х лет)' },
    { value: 'middle', label: 'Middle (от 2 до 5 лет)' },
    { value: 'senior', label: 'Senior (более 5 лет)' },
    { value: 'lead', label: 'Team Lead/Tech Lead' },
  ]

  const technologyDirections = [
    'Backend',
    'Frontend',
    'Fullstack',
    'Mobile (iOS, Android)',
    'DevOps/SRE',
    'Data Science/ML',
    'Testing/QA',
    'Information Security',
    'Database Administration',
    'UI/UX Design',
    'Game Development',
    'AR/VR',
    'Embedded Systems',
    'Blockchain',
    'Enterprise Applications',
    'Cloud Technologies (AWS, Azure, Google Cloud)',
  ]

  const programmingLanguages = [
    'Python',
    'JavaScript (React, Angular, Vue.js)',
    'TypeScript',
    'PHP',
    'Ruby on Rails',
    'C#',
    'Kotlin',
    'Swift',
    'Go',
    'Rust',
    'Scala',
    'SQL',
    'Bash',
    'Shell scripting',
    'Lua',
    'Perl/Python Scripts',
    'HTML/CSS',
  ]

  const additionalSkills = [
    'Docker/Kubernetes',
    'Git/GitHub',
    'CI/CD (Jenkins, TravisCI, GitLab CI)',
    'REST API/GraphQL',
    'NoSQL (MongoDB, Cassandra)',
    'BigData (Spark, Hadoop)',
    'ML Methods (TensorFlow, PyTorch)',
    'WebAssembly/WASM',
    'React Native/Flutter',
    'Unity/Unreal Engine',
    'Communication Protocols (HTTPS, gRPC)',
  ]

  const englishLevels = [
    { value: 'basic', label: 'Базовый уровень' },
    { value: 'intermediate', label: 'Средний уровень' },
    { value: 'advanced', label: 'Продвинутый уровень' },
    { value: 'fluent', label: 'Свободное владение' },
  ]

  const companySizes = [
    { value: 'startup', label: 'Стартапы (<10 сотрудников)' },
    { value: 'small', label: 'Небольшие компании (10-50 сотрудников)' },
    { value: 'medium', label: 'Средние компании (50-200 сотрудников)' },
    { value: 'large', label: 'Большие корпорации (>200 сотрудников)' },
  ]

  const industries = [
    'ИТ-компании',
    'Банковский сектор',
    'E-commerce',
    'Телекоммуникационные услуги',
    'Интернет-сервисы',
    'Образование',
    'Геймдевелопмент',
    'Fintech',
    'Логистика и транспортировка',
    'Консалтинговые фирмы',
    'Государственные учреждения',
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Тип занятости и формат работы
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Тип занятости</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employmentTypes.map(type => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.employmentType.includes(type.value)}
                      onChange={() => toggleFilter('employmentType', type.value)}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1">{type.label}</span>
                    {filters.employmentType.includes(type.value) && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Формат работы</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {workFormats.map(format => (
                  <label
                    key={format.value}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.workFormat.includes(format.value)}
                      onChange={() => toggleFilter('workFormat', format.value)}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1">{format.label}</span>
                    {filters.workFormat.includes(format.value) && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 1: // Опыт работы
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Опыт работы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {experienceLevels.map(level => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.experience === level.value}
                      onChange={() => setFilters({
                        ...filters,
                        experience: filters.experience === level.value ? '' : level.value
                      })}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1">{level.label}</span>
                    {filters.experience === level.value && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 2: // Регион/Город и знание языка
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Регион/Город</h3>
              <input
                type="text"
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                placeholder="Например: Москва, Санкт-Петербург"
                className="input-field w-full"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Знание английского языка</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {englishLevels.map(level => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.englishLevel === level.value}
                      onChange={() => setFilters({
                        ...filters,
                        englishLevel: filters.englishLevel === level.value ? '' : level.value
                      })}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1">{level.label}</span>
                    {filters.englishLevel === level.value && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3: // Диапазон зарплаты
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Диапазон зарплаты</h3>
              <input
                type="text"
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                placeholder="Например: от 100000 до 200000 ₽"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 p-4 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan">
                <input
                  type="checkbox"
                  checked={filters.salaryUnlimited}
                  onChange={(e) => setFilters({ ...filters, salaryUnlimited: e.target.checked })}
                  className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                />
                <span className="text-gray-300 flex-1">Без ограничений по зарплате</span>
                {filters.salaryUnlimited && (
                  <Check className="h-5 w-5 text-accent-cyan" />
                )}
              </label>
            </div>
          </div>
        )

      case 4: // Отрасль бизнеса работодателя
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Отрасль бизнеса работодателя</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {industries.map(industry => (
                  <label
                    key={industry}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.industry === industry}
                      onChange={() => setFilters({
                        ...filters,
                        industry: filters.industry === industry ? '' : industry
                      })}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1 text-sm">{industry}</span>
                    {filters.industry === industry && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 5: // Языки программирования
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Языки программирования</h3>
              
              {/* Список предустановленных языков программирования */}
              <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {programmingLanguages.map(lang => (
                  <label
                    key={lang}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.programmingLanguages.includes(lang)}
                      onChange={() => toggleFilter('programmingLanguages', lang)}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1 text-sm">{lang}</span>
                    {filters.programmingLanguages.includes(lang) && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 6: // Технологическое направление
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Технологическое направление</h3>
              
              {/* Список технологических направлений */}
              <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {technologyDirections.map(tech => (
                  <label
                    key={tech}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.technology.includes(tech)}
                      onChange={() => toggleFilter('technology', tech)}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1 text-sm">{tech}</span>
                    {filters.technology.includes(tech) && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 7: // Дополнительные навыки
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Дополнительные навыки</h3>
              
              {/* Поле для ввода дополнительного навыка */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && customSkillInput.trim()) {
                        const skill = customSkillInput.trim()
                        if (!filters.additionalSkills.includes(skill) && !additionalSkills.includes(skill)) {
                          setFilters({
                            ...filters,
                            additionalSkills: [...filters.additionalSkills, skill]
                          })
                        }
                        setCustomSkillInput('')
                      }
                    }}
                    placeholder="Введите дополнительный навык и нажмите Enter"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => {
                      if (customSkillInput.trim()) {
                        const skill = customSkillInput.trim()
                        if (!filters.additionalSkills.includes(skill) && !additionalSkills.includes(skill)) {
                          setFilters({
                            ...filters,
                            additionalSkills: [...filters.additionalSkills, skill]
                          })
                        }
                        setCustomSkillInput('')
                      }
                    }}
                    className="btn-primary px-4"
                  >
                    Добавить
                  </button>
                </div>
              </div>

              {/* Список предустановленных навыков */}
              <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {additionalSkills.map(skill => (
                  <label
                    key={skill}
                    className="flex items-center gap-3 p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors border border-transparent hover:border-accent-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={filters.additionalSkills.includes(skill)}
                      onChange={() => toggleFilter('additionalSkills', skill)}
                      className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card"
                    />
                    <span className="text-gray-300 flex-1 text-sm">{skill}</span>
                    {filters.additionalSkills.includes(skill) && (
                      <Check className="h-5 w-5 text-accent-cyan" />
                    )}
                  </label>
                ))}
              </div>

              {/* Выбранные дополнительные навыки (включая пользовательские) */}
              {filters.additionalSkills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Выбранные навыки:</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.additionalSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-accent-cyan/20 border border-accent-cyan/50 rounded-lg"
                      >
                        <span className="text-white text-sm">{skill}</span>
                        <button
                          onClick={() => {
                            setFilters({
                              ...filters,
                              additionalSkills: filters.additionalSkills.filter((_, i) => i !== index)
                            })
                          }}
                          className="text-accent-cyan hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <>
      {/* Backdrop - покрывает весь экран включая навбар и футер */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 100
        }}
        onClick={onClose}
      />
      {/* Модальное окно */}
      <div 
        className="fixed flex items-start justify-center z-[101] pointer-events-none" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 101,
          padding: '1rem',
          paddingTop: '5rem'
        }}
      >
        <div className="pointer-events-auto w-full max-w-4xl">
      <Card className="max-w-4xl w-full max-h-[85vh] min-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-dark-surface">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Фильтры вакансий</h2>
            <p className="text-gray-400 text-sm">
              Шаг {currentStep + 1} из {steps.length}: {steps[currentStep].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => {
                      setCurrentStep(index)
                    }}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors cursor-pointer ${
                      index <= currentStep
                        ? 'bg-accent-cyan border-accent-cyan text-dark-bg hover:bg-accent-cyan/90'
                        : 'bg-dark-surface border-gray-600 text-gray-400 hover:border-accent-cyan/50'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id + 1}</span>
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        index < currentStep ? 'bg-accent-cyan' : 'bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-dark-surface">
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-accent-cyan transition-colors"
          >
            Сбросить все
          </button>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Назад
              </button>
            )}
            <button
              onClick={handleSearch}
              className="btn-primary flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              Поиск вакансий
            </button>
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                className="btn-secondary flex items-center gap-2"
              >
                Далее
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}

export default FilterWizard
