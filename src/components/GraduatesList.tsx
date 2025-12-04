import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X, MapPin, User, Eye } from 'lucide-react'
import Card from './ui/Card'
import GraduatesFilterWizard, { GraduateFilterData } from './GraduatesFilterWizard'
import { getImageUrl } from '../utils/image.utils'

export interface Graduate {
  id: string
  userId: number
  firstName: string
  lastName: string
  middleName?: string
  city: string
  education: string
  experience: string
  about: string
  photo?: string
  skills?: string[]
  technology?: string[]
  programmingLanguages?: string[]
  additionalSkills?: string[]
  englishLevel?: 'basic' | 'intermediate' | 'advanced' | 'fluent'
  workFormat?: 'office' | 'hybrid' | 'remote'
  employmentType?: string[]
}

interface GraduatesListProps {
  graduates: Graduate[]
  onFiltersChange?: (hasFilters: boolean) => void
}

const GraduatesList = ({ graduates, onFiltersChange }: GraduatesListProps) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilterWizard, setShowFilterWizard] = useState(false)
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null)
  
  // Функция для получения случайных выпускников (если нет фильтров)
  const getRandomGraduates = (grads: Graduate[], count: number = 10): Graduate[] => {
    const shuffled = [...grads].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

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
  }, [graduates])
  
  const [filters, setFilters] = useState<GraduateFilterData>({
    workFormat: [],
    region: '',
    experience: '',
    education: '',
    educationInstitutions: [],
    technology: [],
    programmingLanguages: [],
    additionalSkills: [],
    additionalSkillsCustom: '',
    englishLevel: '',
  })

  const handleApplyFilters = (newFilters: GraduateFilterData) => {
    setFilters(newFilters)
    const hasActiveFilters = 
      newFilters.workFormat.length > 0 || 
      newFilters.region !== '' || 
      newFilters.experience !== '' || 
      newFilters.education !== '' ||
      newFilters.educationInstitutions.length > 0 ||
      newFilters.technology.length > 0 ||
      newFilters.programmingLanguages.length > 0 ||
      newFilters.additionalSkills.length > 0 ||
      newFilters.englishLevel !== ''
    if (onFiltersChange) {
      onFiltersChange(hasActiveFilters)
    }
  }

  // Определяем, применены ли фильтры
  const hasActiveFilters = 
    filters.workFormat.length > 0 || 
    filters.region !== '' || 
    filters.experience !== '' || 
    filters.education !== '' ||
    filters.educationInstitutions.length > 0 ||
    filters.technology.length > 0 ||
    filters.programmingLanguages.length > 0 ||
    filters.additionalSkills.length > 0 ||
    filters.englishLevel !== '' ||
    searchTerm !== ''

  // Если нет фильтров, показываем случайных выпускников
  const graduatesToFilter = hasActiveFilters ? graduates : getRandomGraduates(graduates, 10)

  const filteredGraduates = graduatesToFilter.filter(graduate => {
    const fullName = `${graduate.firstName} ${graduate.lastName} ${graduate.middleName || ''}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      graduate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.about.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (graduate.skills && graduate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesWorkFormat = filters.workFormat.length === 0 || 
      (graduate.workFormat && filters.workFormat.includes(graduate.workFormat))
    
    const matchesRegion = !filters.region || 
      graduate.city.toLowerCase().includes(filters.region.toLowerCase())
    
    const matchesExperience = !filters.experience || 
      graduate.experience.toLowerCase().includes(filters.experience.toLowerCase())
    
    const matchesEducation = !filters.education || 
      graduate.education.toLowerCase().includes(filters.education.toLowerCase())
    
    const matchesEducationInstitutions = filters.educationInstitutions.length === 0 ||
      filters.educationInstitutions.some(inst => 
        graduate.education.toLowerCase().includes(inst.toLowerCase())
      )
    
    const matchesTechnology = filters.technology.length === 0 ||
      (graduate.technology && filters.technology.some(t => graduate.technology?.includes(t)))
    
    const matchesLanguages = filters.programmingLanguages.length === 0 ||
      (graduate.programmingLanguages && filters.programmingLanguages.some(l => graduate.programmingLanguages?.includes(l)))
    
    const matchesSkills = filters.additionalSkills.length === 0 ||
      (graduate.additionalSkills && filters.additionalSkills.some(s => graduate.additionalSkills?.includes(s)))
    
    const matchesEnglish = !filters.englishLevel || graduate.englishLevel === filters.englishLevel
    
    return matchesSearch && matchesWorkFormat && matchesRegion &&
           matchesExperience && matchesEducation && matchesEducationInstitutions &&
           matchesTechnology && matchesLanguages &&
           matchesSkills && matchesEnglish
  })

  const clearFilters = () => {
    setFilters({
      workFormat: [],
      region: '',
      experience: '',
      education: '',
      educationInstitutions: [],
      technology: [],
      programmingLanguages: [],
      additionalSkills: [],
      additionalSkillsCustom: '',
      englishLevel: '',
    })
    if (onFiltersChange) {
      onFiltersChange(false)
    }
  }

  const handleViewProfile = (graduate: Graduate) => {
    setSelectedGraduate(graduate)
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
              placeholder={t('graduates.searchPlaceholder')}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilterWizard(true)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            {t('graduates.filters')}
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.workFormat.length > 0 || 
          filters.region || 
          filters.experience || 
          filters.education ||
          filters.educationInstitutions.length > 0 ||
          filters.technology.length > 0 ||
          filters.programmingLanguages.length > 0 ||
          filters.additionalSkills.length > 0 ||
          filters.englishLevel) && (
          <div className="mt-4 pt-4 border-t border-dark-surface">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-400 text-sm">{t('common.activeFilters')}:</span>
              {filters.workFormat.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('graduates.workFormat')} ({filters.workFormat.length})
                </span>
              )}
              {filters.region && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.region}
                </span>
              )}
              {filters.experience && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.experience === 'no-experience' ? t('graduates.experience.none') :
                   filters.experience === 'junior' ? t('graduates.experience.junior') :
                   filters.experience === 'middle' ? t('graduates.experience.middle') :
                   filters.experience === 'senior' ? t('graduates.experience.senior') :
                   filters.experience === 'lead' ? 'Team Lead/Tech Lead' : filters.experience}
                </span>
              )}
              {filters.education && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('graduates.education')}: {filters.education}
                </span>
              )}
              {filters.educationInstitutions.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('graduates.institutions')} ({filters.educationInstitutions.length})
                </span>
              )}
              {filters.technology.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('graduates.technologies')} ({filters.technology.length})
                </span>
              )}
              {filters.programmingLanguages.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('graduates.languages')} ({filters.programmingLanguages.length})
                </span>
              )}
              {filters.additionalSkills.length > 0 && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {t('graduates.additionalSkills')} ({filters.additionalSkills.length})
                </span>
              )}
              {filters.englishLevel && (
                <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                  {filters.englishLevel === 'basic' ? t('graduates.english.basic') :
                   filters.englishLevel === 'intermediate' ? t('graduates.english.intermediate') :
                   filters.englishLevel === 'advanced' ? t('graduates.english.advanced') :
                   filters.englishLevel === 'fluent' ? t('graduates.english.fluent') : 'English'}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-accent-cyan text-sm transition-colors"
              >
                {t('common.resetAll')}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Filter Wizard Modal */}
      <GraduatesFilterWizard
        isOpen={showFilterWizard}
        onClose={() => setShowFilterWizard(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Graduates List */}
      <div className="space-y-4">
        {filteredGraduates.length > 0 ? (
          filteredGraduates.map((graduate, index) => (
            <Card key={graduate.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
              <div className="flex gap-4">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {graduate.photo ? (
                    <img
                      src={getImageUrl(graduate.photo)}
                      alt={`${graduate.firstName} ${graduate.lastName}`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-accent-cyan/50"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-dark-surface border-2 border-accent-cyan/50 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {graduate.lastName} {graduate.firstName} {graduate.middleName || ''}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-gray-300 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{graduate.city}</span>
                    </div>
                    {graduate.education && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{graduate.education}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{graduate.about}</p>
                  
                  {/* Skills */}
                  {graduate.skills && graduate.skills.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {graduate.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-dark-surface text-accent-cyan text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {graduate.skills.length > 5 && (
                        <span className="px-2 py-1 bg-dark-surface text-gray-400 text-xs rounded">
                          +{graduate.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Experience */}
                  {graduate.experience && (
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-dark-surface text-accent-cyan text-xs rounded">
                        {graduate.experience}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleViewProfile(graduate)}
                    className="btn-primary text-sm whitespace-nowrap flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {t('candidates.viewResume')}
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-gray-300 text-center py-8">{t('common.noResults')}</p>
          </Card>
        )}
      </div>

      {/* Graduate Profile Modal */}
      {selectedGraduate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {selectedGraduate.photo ? (
                  <img
                    src={getImageUrl(selectedGraduate.photo)}
                    alt={`${selectedGraduate.firstName} ${selectedGraduate.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-accent-cyan/50"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-dark-surface border-2 border-accent-cyan/50 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedGraduate.lastName} {selectedGraduate.firstName} {selectedGraduate.middleName || ''}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedGraduate(null)}
                className="p-2 text-gray-400 hover:bg-dark-surface rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">{t('profile.city')}</label>
                <p className="text-white">{selectedGraduate.city}</p>
              </div>
              {selectedGraduate.education && (
                <div>
                  <label className="text-gray-400 text-sm">{t('profile.education')}</label>
                  <p className="text-white">{selectedGraduate.education}</p>
                </div>
              )}
              {selectedGraduate.experience && (
                <div>
                  <label className="text-gray-400 text-sm">{t('profile.experience')}</label>
                  <p className="text-white">{selectedGraduate.experience}</p>
                </div>
              )}
              {selectedGraduate.about && (
                <div>
                  <label className="text-gray-400 text-sm">{t('profile.about')}</label>
                  <p className="text-white whitespace-pre-wrap">{selectedGraduate.about}</p>
                </div>
              )}
              {selectedGraduate.skills && selectedGraduate.skills.length > 0 && (
                <div>
                  <label className="text-gray-400 text-sm">{t('profile.skills')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGraduate.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedGraduate.programmingLanguages && selectedGraduate.programmingLanguages.length > 0 && (
                <div>
                  <label className="text-gray-400 text-sm">{t('graduates.languages')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGraduate.programmingLanguages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-dark-surface text-accent-cyan text-sm rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedGraduate.technology && selectedGraduate.technology.length > 0 && (
                <div>
                  <label className="text-gray-400 text-sm">{t('graduates.technologies')}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGraduate.technology.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 bg-dark-surface text-accent-cyan text-sm rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedGraduate.englishLevel && (
                <div>
                  <label className="text-gray-400 text-sm">{t('graduates.english.basic').split(':')[0]}</label>
                  <p className="text-white">
                    {selectedGraduate.englishLevel === 'basic' ? t('autoRadar.levels.basic') :
                     selectedGraduate.englishLevel === 'intermediate' ? t('autoRadar.levels.intermediate') :
                     selectedGraduate.englishLevel === 'advanced' ? t('autoRadar.levels.advanced') :
                     t('autoRadar.levels.expert')}
                  </p>
                </div>
              )}
              {selectedGraduate.workFormat && (
                <div>
                  <label className="text-gray-400 text-sm">{t('graduates.workFormat')}</label>
                  <p className="text-white">
                    {selectedGraduate.workFormat === 'office' ? t('vacancies.office') :
                     selectedGraduate.workFormat === 'hybrid' ? t('vacancies.hybrid') :
                     t('vacancies.remote')}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setSelectedGraduate(null)}
                  className="btn-secondary flex-1"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default GraduatesList

