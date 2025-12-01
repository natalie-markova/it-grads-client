import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import JobsList, { type Job } from '../../../components/JobsList'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import { $api } from '../../../utils/axios.instance'
import toast from 'react-hot-toast'

const Jobs = () => {
  useScrollAnimation()
  const { user } = useOutletContext<OutletContext>()
  const [jobs, setJobs] = useState<Job[]>([])
  const [showRecommended, setShowRecommended] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadJobs()
    if (user) {
      loadFavorites()
      loadApplications()
    }
  }, [user, showRecommended])

  const loadApplications = async () => {
    if (!user) return
    try {
      const response = await $api.get('/applications/my')
      const appliedVacancyIds = new Set(response.data.map((app: any) => app.vacancyId))
      setAppliedIds(appliedVacancyIds)
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    try {
      const response = await $api.get('/favorites')
      const favoriteVacancyIds = new Set(response.data.map((v: any) => v.id))
      setFavoriteIds(favoriteVacancyIds)
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleToggleFavorite = async (jobId: string) => {
    if (!user) {
      toast.error('Необходимо авторизоваться')
      return
    }

    try {
      const vacancyId = parseInt(jobId, 10)
      if (isNaN(vacancyId)) {
        toast.error('Неверный ID вакансии')
        return
      }

      const isFavorite = favoriteIds.has(vacancyId)

      if (isFavorite) {
        // Удаляем из избранного
        await $api.delete(`/favorites/${vacancyId}`)
        setFavoriteIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(vacancyId)
          return newSet
        })
        toast.success('Вакансия удалена из избранного')
      } else {
        // Добавляем в избранное
        await $api.post('/favorites', { vacancyId })
        setFavoriteIds(prev => new Set(prev).add(vacancyId))
        toast.success('Вакансия добавлена в избранное')
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при изменении избранного'
      toast.error(errorMessage)
    }
  }

  const loadJobs = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

      // Если пользователь авторизован и выбраны рекомендованные вакансии
      const endpoint = user && showRecommended
        ? `${apiUrl}/vacancies/recommended/${user.id}`
        : `${apiUrl}/vacancies`;

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.map((job: any) => ({
          id: job.id.toString(),
          title: job.title,
          company: job.companyName || job.company || '',
          description: job.description || '',
          requirements: job.requirements || '',
          salary: job.salary ? job.salary.toString() : '',
          location: job.location || '',
          type: job.employmentType || job.type || 'full-time',
          workFormat: job.workFormat || 'office',
          experience: job.level || job.experience || 'junior',
          technology: job.skills || job.technology || [],
          programmingLanguages: job.skills || job.programmingLanguages || [],
          additionalSkills: job.skills || job.additionalSkills || [],
          englishLevel: job.englishLevel || '',
          companySize: job.companySize || '',
          industry: job.industry || '',
          createdAt: job.createdAt || new Date().toISOString(),
          matchScore: job.matchScore || 0,
          matchingSkills: job.matchingSkills || []
        })))
      } else if (response.status === 404) {
        // Эндпоинт не найден - показываем пустой список
        console.log('Jobs endpoint not found, showing empty list')
        setJobs([])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      // В случае ошибки показываем пустой список
      setJobs([])
    }
  }

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error('Необходимо авторизоваться')
      return
    }

    try {
      const vacancyId = parseInt(jobId, 10)
      
      if (isNaN(vacancyId)) {
        toast.error('Неверный ID вакансии')
        return
      }

      await $api.post('/applications', { vacancyId })
      setAppliedIds(prev => new Set(prev).add(vacancyId))
      toast.success('Отклик успешно отправлен!')
    } catch (error: any) {
      console.error('Error applying to job:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при отправке отклика'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section title="Вакансии" subtitle="Найдите работу мечты среди тысяч актуальных вакансий" className="bg-dark-bg py-0 scroll-animate-item">
        {user && (
          <div className="mb-6 flex gap-4 items-center">
            <button
              onClick={() => setShowRecommended(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showRecommended
                  ? 'bg-accent-cyan text-white'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              Все вакансии
            </button>
            <button
              onClick={() => setShowRecommended(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showRecommended
                  ? 'bg-accent-cyan text-white'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              Рекомендованные для вас
            </button>
          </div>
        )}
        <JobsList 
          jobs={jobs} 
          onApply={handleApply}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          appliedIds={appliedIds}
        />
      </Section>
    </div>
  )
}

export default Jobs
