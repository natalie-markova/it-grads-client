import { useState, useEffect } from 'react'
import JobsList, { Job } from '../../../components/JobsList'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const Jobs = () => {
  useScrollAnimation()
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/jobs`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.map((job: any) => ({
          id: job.id.toString(),
          title: job.title,
          company: job.company,
          description: job.description || '',
          requirements: job.requirements || '',
          salary: job.salary || '',
          location: job.location || '',
          type: job.type || 'full-time',
          experience: job.experience || 'junior',
          createdAt: job.created_at || new Date().toISOString(),
        })))
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const handleApply = async (jobId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobId })
      })
      
      if (response.ok) {
        alert('Отклик успешно отправлен!')
      } else {
        const data = await response.json()
        alert(data.error || 'Ошибка при отправке отклика')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Ошибка при отправке отклика')
    }
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section title="Вакансии" subtitle="Найдите работу мечты среди тысяч актуальных вакансий" className="bg-dark-bg py-0 scroll-animate-item">
        <JobsList jobs={jobs} onApply={handleApply} />
      </Section>
    </div>
  )
}

export default Jobs

