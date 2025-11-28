import { useState, useEffect } from 'react'
import GraduatesList, { type Graduate } from '../../../components/GraduatesList'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const Graduates = () => {
  useScrollAnimation()
  const [graduates, setGraduates] = useState<Graduate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGraduates()
  }, [])

  const loadGraduates = async () => {
    try {
      setIsLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      
      // Пока загружаем всех выпускников (в будущем можно добавить фильтрацию на бэкенде)
      const response = await fetch(`${apiUrl}/graduates`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setGraduates(data.map((grad: any) => ({
          id: grad.id?.toString() || grad.userId?.toString() || Math.random().toString(),
          userId: grad.userId || grad.id,
          firstName: grad.firstName || grad.first_name || '',
          lastName: grad.lastName || grad.last_name || '',
          middleName: grad.middleName || grad.middle_name || '',
          city: grad.city || '',
          education: grad.education || '',
          experience: grad.experience || '',
          about: grad.about || '',
          photo: grad.photo || grad.avatar || '',
          skills: grad.skills || [],
          technology: grad.technology || [],
          programmingLanguages: grad.programmingLanguages || grad.programming_languages || [],
          additionalSkills: grad.additionalSkills || grad.additional_skills || [],
          englishLevel: grad.englishLevel || grad.english_level,
          workFormat: grad.workFormat || grad.work_format,
          employmentType: grad.employmentType || grad.employment_type || [],
        })))
      } else if (response.status === 404) {
        // Эндпоинт не найден - показываем пустой список
        console.log('Graduates endpoint not found, showing empty list')
        setGraduates([])
      }
    } catch (error) {
      console.error('Error loading graduates:', error)
      // В случае ошибки показываем пустой список
      setGraduates([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section 
        title="Выпускники" 
        subtitle="Найдите подходящих кандидатов среди выпускников" 
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-300">Загрузка...</p>
          </div>
        ) : (
          <GraduatesList 
            graduates={graduates}
          />
        )}
      </Section>
    </div>
  )
}

export default Graduates

