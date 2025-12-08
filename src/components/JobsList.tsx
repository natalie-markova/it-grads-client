import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X, MapPin, DollarSign, Briefcase, Heart, Check, MessageSquare } from 'lucide-react'
import Card from './ui/Card'
import FilterWizard, { type FilterData } from './FilterWizard'
import { chatAPI } from '../utils/chat.api'
import { OutletContext } from '../types'
import toast from 'react-hot-toast'

export interface Job {
  id: string
  title: string
  company: string
  description: string
  requirements: string
  salary: string
  location: string
  type: 'full-time' | 'part-time' | 'remote' | 'hybrid' | 'internship' | 'freelance'
  workFormat?: 'office' | 'hybrid' | 'remote'
  experience: 'no-experience' | 'junior' | 'middle' | 'senior' | 'lead'
  technology?: string[]
  programmingLanguages?: string[]
  additionalSkills?: string[]
  englishLevel?: 'basic' | 'intermediate' | 'advanced' | 'fluent'
  companySize?: 'startup' | 'small' | 'medium' | 'large'
  industry?: string
  salaryMin?: number
  salaryMax?: number
  createdAt: string
  matchScore?: number
  matchingSkills?: string[]
  learningPathSkills?: string[]
  matchedRoadmap?: string
  matchReason?: 'skills' | 'roadmap' | 'skills_and_roadmap' | 'learning_path' | 'no_profile'
  employerId?: number
}

interface JobsListProps {
  jobs: Job[]
  onApply?: (jobId: string) => void
  favoriteIds?: Set<number>
  onToggleFavorite?: (jobId: string) => void
  appliedIds?: Set<number>
}

const JobsList = ({ jobs, onApply, favoriteIds = new Set(), onToggleFavorite, appliedIds = new Set() }: JobsListProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useOutletContext<OutletContext>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [showFilterWizard, setShowFilterWizard] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  // Scroll-driven animation setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const items = document.querySelectorAll('.scroll-animate-item')
    items.forEach((item) => observer.observe(item))

    return () => {
      items.forEach((item) => observer.unobserve(item))
    }
  }, [jobs])

  // Блокировка прокрутки и обработчик Escape для модального окна
  useEffect(() => {
    if (selectedJob) {
      // Блокируем прокрутку фона
      document.body.style.overflow = 'hidden'
      
      // Обработчик Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedJob(null)
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [selectedJob])
  
  const [filters, setFilters] = useState<FilterData>({
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

  const handleApplyFilters = (newFilters: FilterData) => {
    setFilters(newFilters)
  }

  const filteredJobs = jobs.filter(job => {
    // Поиск по тексту
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Фильтр по типу занятости
    // API возвращает: 'full-time', 'part-time', 'contract', 'internship'
    // Фильтр может содержать: 'full-time', 'part-time', 'remote', 'freelance', 'internship'
    const matchesEmploymentType = filters.employmentType.length === 0 || 
      filters.employmentType.some(filterType => {
        // Маппинг значений фильтра на значения из API
        if (filterType === 'remote' || filterType === 'freelance') {
          // Эти значения не существуют в API, но могут быть в workFormat
          // Пропускаем проверку по employmentType для этих значений
          return true
        }
        return job.type === filterType
      })
    
    // Фильтр по формату работы (workFormat не приходит из API, всегда 'office' по умолчанию)
    const matchesWorkFormat = filters.workFormat.length === 0 || 
      (job.workFormat && filters.workFormat.includes(job.workFormat))
    
    // Фильтр по региону
    const matchesRegion = !filters.region || 
      (job.location && job.location.toLowerCase().includes(filters.region.toLowerCase()))
    
    // Фильтр по опыту
    // API возвращает: 'junior', 'middle', 'senior', 'lead'
    // Фильтр может содержать: 'no-experience', 'junior', 'middle', 'senior', 'lead'
    const matchesExperience = !filters.experience || 
      (filters.experience === 'no-experience' ? false : job.experience === filters.experience)
    
    // Фильтр по зарплате
    const matchesSalary = filters.salaryUnlimited || 
      !filters.salary ||
      (job.salary && job.salary.toLowerCase().includes(filters.salary.toLowerCase()))
    
    // Фильтр по навыкам (skills из API используется для всех категорий)
    // Проверяем, есть ли хотя бы один навык из фильтра в массиве skills вакансии
    const jobSkills = job.technology || job.programmingLanguages || job.additionalSkills || []
    const allFilterSkills = [
      ...filters.technology,
      ...filters.programmingLanguages,
      ...filters.additionalSkills
    ]
    
    const matchesSkills = allFilterSkills.length === 0 ||
      (jobSkills.length > 0 && allFilterSkills.some(filterSkill => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.toLowerCase().includes(filterSkill.toLowerCase()) ||
          filterSkill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      ))
    
    // Фильтр по английскому (если есть в данных)
    const matchesEnglish = !filters.englishLevel || 
      (job.englishLevel && job.englishLevel === filters.englishLevel)
    
    // Фильтр по размеру компании (если есть в данных)
    const matchesCompanySize = !filters.companySize || 
      (job.companySize && job.companySize === filters.companySize)
    
    // Фильтр по отрасли (если есть в данных)
    const matchesIndustry = !filters.industry || 
      (job.industry && job.industry.toLowerCase().includes(filters.industry.toLowerCase()))
    
    return matchesSearch && matchesEmploymentType && matchesWorkFormat && matchesRegion &&
           matchesExperience && matchesSalary && matchesSkills && 
           matchesEnglish && matchesCompanySize && matchesIndustry
  })

  const selectedJobData = jobs.find(j => {
    const jobId = String(j.id);
    const selectedId = String(selectedJob);
    return jobId === selectedId;
  })

  const handleApply = (jobId: string) => {
    if (onApply) {
      onApply(jobId)
    }
    // Toast notification will be shown in Jobs.tsx
  }

  const clearFilters = () => {
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

  const handleStartChat = async (employerId: number) => {
    if (!user) {
      toast.error(t('vacancies.chat.loginRequired'))
      navigate('/login')
      return
    }

    if (user.role !== 'graduate') {
      toast.error(t('vacancies.chat.graduateOnly'))
      return
    }

    setIsCreatingChat(true)
    try {
      const chat = await chatAPI.createChat(employerId)
      toast.success(t('vacancies.success.chatCreated'))
      navigate(`/messenger/${chat.id}`)
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error(t('vacancies.chat.chatError'))
    } finally {
      setIsCreatingChat(false)
    }
  }


  return (
    <div>
      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('vacancies.search')}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilterWizard(true)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            {t('vacancies.filters')}
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.employmentType.length > 0 || 
          filters.workFormat.length > 0 || 
          filters.region || 
          filters.experience || 
          filters.technology.length > 0 ||
          filters.programmingLanguages.length > 0 ||
          filters.additionalSkills.length > 0 ||
          filters.englishLevel ||
          filters.companySize ||
          filters.industry ||
          filters.salary) && (
          <div className="mt-4 pt-4 border-t border-dark-surface">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-400 text-sm">{t('vacancies.filterLabels.activeFilters')}</span>
              {filters.employmentType.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.employmentType')} ({filters.employmentType.length})
                </span>
              )}
              {filters.workFormat.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.format')} ({filters.workFormat.length})
                </span>
              )}
              {filters.region && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.region}
                </span>
              )}
              {filters.experience && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.experience === 'no-experience' ? t('vacancies.levels.noExperience') :
                   filters.experience === 'junior' ? t('vacancies.levels.juniorFull') :
                   filters.experience === 'middle' ? t('vacancies.levels.middleFull') :
                   filters.experience === 'senior' ? t('vacancies.levels.seniorFull') :
                   filters.experience === 'lead' ? t('vacancies.levels.teamLead') : filters.experience}
                </span>
              )}
              {filters.salary && !filters.salaryUnlimited && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.salary')} {filters.salary}
                </span>
              )}
              {filters.technology.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.technologies')} ({filters.technology.length})
                </span>
              )}
              {filters.programmingLanguages.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.languages')} ({filters.programmingLanguages.length})
                </span>
              )}
              {filters.additionalSkills.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.skills')} ({filters.additionalSkills.length})
                </span>
              )}
              {filters.englishLevel && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('vacancies.filterLabels.english')}: {t(`vacancies.english.${filters.englishLevel}`)}
                </span>
              )}
              {filters.companySize && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t(`vacancies.companySizes.${filters.companySize}Short`)}
                </span>
              )}
              {filters.industry && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.industry}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-accent-cyan text-sm transition-colors"
              >
                {t('vacancies.filterLabels.clearAll')}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Filter Wizard Modal */}
      <FilterWizard
        isOpen={showFilterWizard}
        onClose={() => setShowFilterWizard(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <Card key={job.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    {job.matchScore !== undefined && job.matchScore > 0 && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.matchScore >= 70 ? 'bg-green-500/20 text-green-400' :
                        job.matchScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {job.matchScore}% {t('vacancies.labels.match')}
                      </span>
                    )}
                    {job.matchReason === 'skills_and_roadmap' && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {t('vacancies.labels.skillsAndMap')}
                      </span>
                    )}
                    {job.matchReason === 'roadmap' && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {t('vacancies.labels.byRoadmap')}
                      </span>
                    )}
                    {job.matchReason === 'learning_path' && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                        {t('vacancies.labels.byLearningPath')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{job.description}</p>
                  {(job.matchingSkills && job.matchingSkills.length > 0) || (job.learningPathSkills && job.learningPathSkills.length > 0) ? (
                    <div className="mb-3 space-y-2">
                      {job.matchingSkills && job.matchingSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{t('vacancies.labels.yourSkills')}:</p>
                          <div className="flex gap-1 flex-wrap">
                            {job.matchingSkills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {job.matchingSkills.length > 5 && (
                              <span className="px-2 py-0.5 text-gray-400 text-xs">
                                +{job.matchingSkills.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {job.learningPathSkills && job.learningPathSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{t('vacancies.labels.learningNow')}:</p>
                          <div className="flex gap-1 flex-wrap">
                            {job.learningPathSkills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {job.learningPathSkills.length > 4 && (
                              <span className="px-2 py-0.5 text-gray-400 text-xs">
                                +{job.learningPathSkills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="px-2 py-1 bg-dark-surface text-accent-cyan text-xs rounded">
                      {job.type === 'full-time' ? t('vacancies.types.fullTime') :
                       job.type === 'part-time' ? t('vacancies.types.partTime') :
                       job.type === 'remote' ? t('vacancies.types.remote') :
                       job.type === 'hybrid' ? t('vacancies.types.hybrid') :
                       job.type === 'internship' ? t('vacancies.types.internship') : t('vacancies.types.freelance')}
                    </span>
                    <span className="px-2 py-1 bg-dark-surface text-accent-cyan text-xs rounded">
                      {job.experience === 'no-experience' ? t('vacancies.levels.noExperience') :
                       job.experience === 'junior' ? t('vacancies.levels.junior') :
                       job.experience === 'middle' ? t('vacancies.levels.middle') :
                       job.experience === 'senior' ? t('vacancies.levels.senior') : t('vacancies.levels.lead')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex gap-2">
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(job.id)
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          favoriteIds.has(parseInt(job.id, 10))
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-dark-surface text-gray-400 hover:bg-dark-card hover:text-accent-cyan'
                        }`}
                        title={favoriteIds.has(parseInt(job.id, 10)) ? t('vacancies.noResults.removeFromFavorites') : t('vacancies.noResults.addToFavorites')}
                      >
                        <Heart
                          className={`h-5 w-5 ${favoriteIds.has(parseInt(job.id, 10)) ? 'fill-current' : ''}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedJob(job.id)}
                      className="btn-secondary text-sm whitespace-nowrap flex-1"
                    >
                      {t('vacancies.details')}
                    </button>
                  </div>
                  {onApply && user && user.role === 'graduate' && (
                    appliedIds.has(parseInt(job.id, 10)) ? (
                      <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 justify-center border border-green-500/30">
                        <Check className="h-4 w-4" />
                        <span>{t('vacancies.applied')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        className="btn-primary text-sm whitespace-nowrap"
                      >
                        {t('vacancies.apply')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-gray-300 text-center py-8">
              {jobs.length === 0 && filteredJobs.length === 0
                ? t('vacancies.noResults.emptyWithHint')
                : t('vacancies.noResults.empty')}
            </p>
          </Card>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJobData && createPortal(
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
          onClick={() => setSelectedJob(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative z-[101]"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Card className="w-full">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedJobData.title}</h2>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{selectedJobData.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedJobData.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dark-surface">
                {selectedJobData.salary && (
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.salary')}</label>
                    <p className="text-white text-lg font-semibold text-accent-cyan">{selectedJobData.salary}</p>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.modal.jobType')}</label>
                  <p className="text-white">
                    {selectedJobData.type === 'full-time' ? t('vacancies.types.fullTime') :
                     selectedJobData.type === 'part-time' ? t('vacancies.types.partTime') :
                     selectedJobData.type === 'remote' ? t('vacancies.types.remote') :
                     selectedJobData.type === 'hybrid' ? t('vacancies.types.hybrid') :
                     selectedJobData.type === 'internship' ? t('vacancies.types.internship') : t('vacancies.types.freelance')}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.experience')}</label>
                  <p className="text-white">
                    {selectedJobData.experience === 'no-experience' ? t('vacancies.levels.noExperience') :
                     selectedJobData.experience === 'junior' ? t('vacancies.levels.juniorFull') :
                     selectedJobData.experience === 'middle' ? t('vacancies.levels.middleFull') :
                     selectedJobData.experience === 'senior' ? t('vacancies.levels.seniorFull') : t('vacancies.levels.lead')}
                  </p>
                </div>
                {selectedJobData.workFormat && (
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.modal.workFormat')}</label>
                    <p className="text-white">
                      {selectedJobData.workFormat === 'office' ? t('vacancies.workFormats.office') :
                       selectedJobData.workFormat === 'hybrid' ? t('vacancies.workFormats.hybrid') : t('vacancies.workFormats.remote')}
                    </p>
                  </div>
                )}
              </div>

              {/* Навыки и технологии */}
              {(selectedJobData.technology && selectedJobData.technology.length > 0) ||
               (selectedJobData.programmingLanguages && selectedJobData.programmingLanguages.length > 0) ||
               (selectedJobData.additionalSkills && selectedJobData.additionalSkills.length > 0) ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">{t('vacancies.modal.requiredSkills')}</h3>
                  <div className="space-y-3">
                    {selectedJobData.technology && selectedJobData.technology.length > 0 && (
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-2 block">{t('vacancies.modal.technologies')}</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedJobData.technology.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedJobData.programmingLanguages && selectedJobData.programmingLanguages.length > 0 && (
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-2 block">{t('vacancies.modal.programmingLanguages')}</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedJobData.programmingLanguages.map((lang, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedJobData.additionalSkills && selectedJobData.additionalSkills.length > 0 && (
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-2 block">{t('vacancies.modal.additionalSkills')}</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedJobData.additionalSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Совпадающие навыки и путь обучения */}
              {((selectedJobData.matchingSkills && selectedJobData.matchingSkills.length > 0) ||
                (selectedJobData.learningPathSkills && selectedJobData.learningPathSkills.length > 0)) && (
                <div className="space-y-4">
                  {selectedJobData.matchedRoadmap && (
                    <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <span className="text-purple-400 text-sm">
                        {t('vacancies.modal.matchesRoadmap')}: <strong>{selectedJobData.matchedRoadmap}</strong>
                      </span>
                    </div>
                  )}
                  {selectedJobData.matchingSkills && selectedJobData.matchingSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">{t('vacancies.modal.yourVerifiedSkills')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJobData.matchingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedJobData.learningPathSkills && selectedJobData.learningPathSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">{t('vacancies.modal.learningPathSkills')}</h3>
                      <p className="text-gray-400 text-sm mb-2">{t('vacancies.modal.learningPathSkillsDesc')}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJobData.learningPathSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Дополнительная информация */}
              {(selectedJobData.englishLevel || selectedJobData.companySize || selectedJobData.industry) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedJobData.englishLevel && (
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.modal.englishLevel')}</label>
                      <p className="text-white">
                        {t(`vacancies.english.${selectedJobData.englishLevel}`)}
                      </p>
                    </div>
                  )}
                  {selectedJobData.companySize && (
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.modal.companySize')}</label>
                      <p className="text-white">
                        {t(`vacancies.companySizes.${selectedJobData.companySize}`)}
                      </p>
                    </div>
                  )}
                  {selectedJobData.industry && (
                    <div className="col-span-2">
                      <label className="text-gray-400 text-sm font-medium mb-1 block">{t('vacancies.modal.industry')}</label>
                      <p className="text-white">{selectedJobData.industry}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Описание */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('vacancies.modal.description')}</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedJobData.description}</p>
              </div>

              {/* Требования */}
              {selectedJobData.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('vacancies.modal.requirements')}</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedJobData.requirements}</p>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex justify-between items-center pt-4 border-t border-dark-surface">
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(selectedJobData.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favoriteIds.has(parseInt(selectedJobData.id, 10))
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-dark-surface text-gray-400 hover:bg-dark-card hover:text-accent-cyan'
                    }`}
                    title={favoriteIds.has(parseInt(selectedJobData.id, 10)) ? t('vacancies.noResults.removeFromFavorites') : t('vacancies.noResults.addToFavorites')}
                  >
                    <Heart
                      className={`h-5 w-5 ${favoriteIds.has(parseInt(selectedJobData.id, 10)) ? 'fill-current' : ''}`}
                    />
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  {user && user.role === 'graduate' && selectedJobData.employerId && appliedIds.has(parseInt(selectedJobData.id, 10)) && (
                    <button
                      onClick={() => handleStartChat(selectedJobData.employerId!)}
                      disabled={isCreatingChat}
                      className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {isCreatingChat ? t('vacancies.chat.creating') : t('vacancies.chat.write')}
                    </button>
                  )}
                  {onApply && user && user.role === 'graduate' && (
                    appliedIds.has(parseInt(selectedJobData.id, 10)) ? (
                      <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 justify-center border border-green-500/30">
                        <Check className="h-4 w-4" />
                        <span>{t('vacancies.applied')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(selectedJobData.id)}
                        className="btn-primary"
                      >
                        {t('vacancies.apply')}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="btn-secondary"
                  >
                    {t('vacancies.modal.close')}
                  </button>
                </div>
              </div>
            </div>
            </Card>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default JobsList
