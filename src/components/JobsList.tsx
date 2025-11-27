import { useState, useEffect } from 'react'
import { Search, Filter, X, MapPin, DollarSign, Briefcase } from 'lucide-react'
import Card from './ui/Card'
import FilterWizard, { FilterData } from './FilterWizard'

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
}

interface JobsListProps {
  jobs: Job[]
  onApply?: (jobId: string) => void
}

const JobsList = ({ jobs, onApply }: JobsListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [showFilterWizard, setShowFilterWizard] = useState(false)

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
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEmploymentType = filters.employmentType.length === 0 || 
      filters.employmentType.includes(job.type)
    
    const matchesWorkFormat = filters.workFormat.length === 0 || 
      (job.workFormat && filters.workFormat.includes(job.workFormat))
    
    const matchesRegion = !filters.region || 
      job.location.toLowerCase().includes(filters.region.toLowerCase())
    
    const matchesExperience = !filters.experience || job.experience === filters.experience
    
    const matchesSalary = filters.salaryUnlimited || 
      !filters.salary ||
      filters.salaryUnlimited ||
      job.salary.toLowerCase().includes(filters.salary.toLowerCase())
    
    const matchesTechnology = filters.technology.length === 0 ||
      (job.technology && filters.technology.some(t => job.technology?.includes(t)))
    
    const matchesLanguages = filters.programmingLanguages.length === 0 ||
      (job.programmingLanguages && filters.programmingLanguages.some(l => job.programmingLanguages?.includes(l)))
    
    const matchesSkills = filters.additionalSkills.length === 0 ||
      (job.additionalSkills && filters.additionalSkills.some(s => job.additionalSkills?.includes(s)))
    
    const matchesEnglish = !filters.englishLevel || job.englishLevel === filters.englishLevel
    const matchesCompanySize = !filters.companySize || job.companySize === filters.companySize
    const matchesIndustry = !filters.industry || job.industry === filters.industry
    
    return matchesSearch && matchesEmploymentType && matchesWorkFormat && matchesRegion &&
           matchesExperience && matchesSalary && matchesTechnology && matchesLanguages &&
           matchesSkills && matchesEnglish && matchesCompanySize && matchesIndustry
  })

  const selectedJobData = jobs.find(j => j.id === selectedJob)

  const handleApply = (jobId: string) => {
    if (onApply) {
      onApply(jobId)
    }
    alert('Отклик отправлен!')
  }

  const clearFilters = () => {
    setFilters({
      employmentType: [],
      workFormat: [],
      region: '',
      experience: '',
      salaryMin: '',
      salaryMax: '',
      salaryUnlimited: false,
      technology: [],
      programmingLanguages: [],
      additionalSkills: [],
      englishLevel: '',
      companySize: '',
      industry: '',
    })
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
              placeholder="Поиск вакансий..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilterWizard(true)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Фильтры
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
          filters.salaryMin ||
          filters.salaryMax) && (
          <div className="mt-4 pt-4 border-t border-dark-surface">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-400 text-sm">Активные фильтры:</span>
              {filters.employmentType.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  Тип занятости ({filters.employmentType.length})
                </span>
              )}
              {filters.workFormat.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  Формат ({filters.workFormat.length})
                </span>
              )}
              {filters.region && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.region}
                </span>
              )}
              {filters.experience && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.experience === 'no-experience' ? 'Нет опыта' :
                   filters.experience === 'junior' ? 'Junior (до 2-х лет)' :
                   filters.experience === 'middle' ? 'Middle (от 2 до 5 лет)' :
                   filters.experience === 'senior' ? 'Senior (более 5 лет)' :
                   filters.experience === 'lead' ? 'Team Lead/Tech Lead' : filters.experience}
                </span>
              )}
              {(filters.salaryMin || filters.salaryMax) && !filters.salaryUnlimited && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  Зарплата: {filters.salaryMin || '0'} - {filters.salaryMax || '∞'}
                </span>
              )}
              {filters.technology.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  Технологии ({filters.technology.length})
                </span>
              )}
              {filters.programmingLanguages.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  Языки ({filters.programmingLanguages.length})
                </span>
              )}
              {filters.additionalSkills.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  Навыки ({filters.additionalSkills.length})
                </span>
              )}
              {filters.englishLevel && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.englishLevel === 'basic' ? 'Английский: Базовый' :
                   filters.englishLevel === 'intermediate' ? 'Английский: Средний' :
                   filters.englishLevel === 'advanced' ? 'Английский: Продвинутый' :
                   filters.englishLevel === 'fluent' ? 'Английский: Свободное владение' : 'Английский'}
                </span>
              )}
              {filters.companySize && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.companySize === 'startup' ? 'Стартапы (<10)' :
                   filters.companySize === 'small' ? 'Небольшие (10-50)' :
                   filters.companySize === 'medium' ? 'Средние (50-200)' :
                   filters.companySize === 'large' ? 'Большие (>200)' : 'Размер компании'}
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
                Сбросить все
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
                  <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
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
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="px-2 py-1 bg-dark-surface text-accent-cyan text-xs rounded">
                      {job.type === 'full-time' ? 'Полный день' : 
                       job.type === 'part-time' ? 'Частичная занятость' :
                       job.type === 'remote' ? 'Удаленно' : 
                       job.type === 'hybrid' ? 'Гибрид' :
                       job.type === 'internship' ? 'Стажировка' : 'Фриланс'}
                    </span>
                    <span className="px-2 py-1 bg-dark-surface text-accent-cyan text-xs rounded">
                      {job.experience === 'no-experience' ? 'Нет опыта' :
                       job.experience === 'junior' ? 'Junior' :
                       job.experience === 'middle' ? 'Middle' : 
                       job.experience === 'senior' ? 'Senior' : 'Lead'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedJob(job.id)}
                    className="btn-secondary text-sm whitespace-nowrap"
                  >
                    Подробнее
                  </button>
                  {onApply && (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      Откликнуться
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-gray-300 text-center py-8">Вакансии не найдены</p>
          </Card>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJobData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedJobData.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 text-gray-400 hover:bg-dark-surface rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Компания</label>
                <p className="text-white">{selectedJobData.company}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Локация</label>
                <p className="text-white">{selectedJobData.location}</p>
              </div>
              {selectedJobData.salary && (
                <div>
                  <label className="text-gray-400 text-sm">Зарплата</label>
                  <p className="text-white">{selectedJobData.salary}</p>
                </div>
              )}
              <div>
                <label className="text-gray-400 text-sm">Тип работы</label>
                <p className="text-white">
                  {selectedJobData.type === 'full-time' ? 'Полный день' : 
                   selectedJobData.type === 'part-time' ? 'Частичная занятость' :
                   selectedJobData.type === 'remote' ? 'Удаленно' : 
                   selectedJobData.type === 'hybrid' ? 'Гибрид' :
                   selectedJobData.type === 'internship' ? 'Стажировка' : 'Фриланс'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Опыт</label>
                <p className="text-white">
                  {selectedJobData.experience === 'no-experience' ? 'Нет опыта' :
                   selectedJobData.experience === 'junior' ? 'Junior' :
                   selectedJobData.experience === 'middle' ? 'Middle' : 
                   selectedJobData.experience === 'senior' ? 'Senior' : 'Lead'}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Описание</label>
                <p className="text-white whitespace-pre-wrap">{selectedJobData.description}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Требования</label>
                <p className="text-white whitespace-pre-wrap">{selectedJobData.requirements}</p>
              </div>
              {onApply && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleApply(selectedJobData.id)}
                    className="btn-primary flex-1"
                  >
                    Откликнуться
                  </button>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="btn-secondary"
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default JobsList
