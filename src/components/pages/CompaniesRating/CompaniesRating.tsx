import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, ChevronRight } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

export interface Company {
  id: string
  name: string
  averageRating: number
  reviewCount: number
}

const CompaniesRating = () => {
  useScrollAnimation()
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/ratings`)
      if (response.ok) {
        const data = await response.json()
        // Сортируем по рейтингу (от большего к меньшему)
        const sorted = data
          .map((company: any) => ({
            id: company.id.toString(),
            name: company.name,
            averageRating: company.average_rating || company.averageRating || 0,
            reviewCount: company.review_count || company.reviewCount || 0,
          }))
          .sort((a: Company, b: Company) => b.averageRating - a.averageRating)
        setCompanies(sorted)
      } else if (response.status === 404) {
        // Если эндпоинт не найден, используем моковые данные
        setCompanies(getMockCompanies())
      }
    } catch (error) {
      console.error('Error loading companies:', error)
      setCompanies(getMockCompanies())
    }
  }

  const getMockCompanies = (): Company[] => {
    return [
      { id: '1', name: 'Яндекс', averageRating: 4.8, reviewCount: 245 },
      { id: '2', name: 'Сбер', averageRating: 4.6, reviewCount: 189 },
      { id: '3', name: 'VK', averageRating: 4.5, reviewCount: 156 },
      { id: '4', name: 'Тинькофф', averageRating: 4.4, reviewCount: 134 },
      { id: '5', name: 'Ozon', averageRating: 4.3, reviewCount: 112 },
      { id: '6', name: 'Альфа-Банк', averageRating: 4.2, reviewCount: 98 },
      { id: '7', name: 'Mail.ru Group', averageRating: 4.1, reviewCount: 87 },
      { id: '8', name: 'Лаборатория Касперского', averageRating: 4.0, reviewCount: 76 },
    ].sort((a, b) => b.averageRating - a.averageRating)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1
      return (
        <Star
          key={index}
          className={`h-5 w-5 ${
            starValue <= Math.round(rating)
              ? 'text-accent-gold fill-accent-gold'
              : 'text-gray-600'
          }`}
        />
      )
    })
  }

  const getMedal = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return null
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title="Рейтинг компаний"
        subtitle="Оцените работодателей и поделитесь своим опытом"
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        <div className="space-y-4">
          {companies.map((company, index) => {
            const position = index + 1
            const medal = getMedal(position)
            return (
              <Card
                key={company.id}
                className="scroll-animate-item"
                style={{ transitionDelay: `${index * 0.05}s` }}
              >
                <Link
                  to={`/companies/${company.id}`}
                  className="flex items-center justify-between p-6 hover:bg-dark-surface/50 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-6 flex-1">
                    {/* Место в рейтинге */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-dark-surface border border-accent-cyan/30">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-white font-bold text-lg">{position}</span>
                      )}
                    </div>

                    {/* Название компании */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-4">
                        {/* Звезды */}
                        <div className="flex items-center gap-1">
                          {renderStars(company.averageRating)}
                          <span className="ml-2 text-gray-300 font-medium">
                            {company.averageRating.toFixed(1)}
                          </span>
                        </div>
                        {/* Количество отзывов */}
                        <span className="text-gray-400 text-sm">
                          {company.reviewCount} {company.reviewCount === 1 ? 'отзыв' : company.reviewCount < 5 ? 'отзыва' : 'отзывов'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка подробнее */}
                  <div className="flex items-center gap-2 text-accent-cyan hover:text-accent-gold transition-colors">
                    <span className="font-medium">Подробнее</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>

        {companies.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-400">Пока нет компаний в рейтинге</p>
          </Card>
        )}
      </Section>
    </div>
  )
}

export default CompaniesRating





