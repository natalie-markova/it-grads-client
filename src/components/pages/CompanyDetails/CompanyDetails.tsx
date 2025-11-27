import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { Star, X, Send, Trash2 } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  employerResponse?: string
  employerResponseCreatedAt?: string
}

const CompanyDetails = () => {
  useScrollAnimation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const [companyName, setCompanyName] = useState<string>('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [userRating, setUserRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [employerResponse, setEmployerResponse] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (id) {
      loadCompanyDetails()
      loadReviews()
    }
  }, [id])

  const loadCompanyDetails = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCompanyName(data.name || 'Компания')
      } else if (response.status === 404) {
        // Моковые данные
        setCompanyName(getMockCompanyName(id))
      }
    } catch (error) {
      console.error('Error loading company:', error)
      setCompanyName(getMockCompanyName(id))
    }
  }

  const getMockCompanyName = (companyId: string): string => {
    const names: { [key: string]: string } = {
      '1': 'Яндекс',
      '2': 'Сбер',
      '3': 'VK',
      '4': 'Тинькофф',
      '5': 'Ozon',
      '6': 'Альфа-Банк',
      '7': 'Mail.ru Group',
      '8': 'Лаборатория Касперского',
    }
    return names[companyId] || 'Компания'
  }

  const loadReviews = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/${id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.map((review: any) => ({
          id: review.id.toString(),
          userId: review.user_id || review.userId,
          userName: review.user_name || review.userName || 'Анонимный пользователь',
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at || review.createdAt,
          employerResponse: review.employer_response || review.employerResponse,
          employerResponseCreatedAt: review.employer_response_created_at || review.employerResponseCreatedAt,
        })))
      } else if (response.status === 404) {
        // Моковые данные
        setReviews(getMockReviews())
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews(getMockReviews())
    }
  }

  const getMockReviews = (): Review[] => {
    return [
      {
        id: '1',
        userId: 'user1',
        userName: 'Анонимный пользователь',
        rating: 5,
        comment: 'Отличная компания, хорошие условия работы, дружный коллектив.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Анонимный пользователь',
        rating: 4,
        comment: 'Хорошая компания, но есть куда расти. Зарплата соответствует рынку.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        employerResponse: 'Спасибо за отзыв! Мы работаем над улучшением условий.',
        employerResponseCreatedAt: new Date(Date.now() - 172700000).toISOString(),
      },
    ]
  }

  const handleStarClick = (rating: number) => {
    setUserRating(rating)
    if (!isWritingReview) {
      setIsWritingReview(true)
    }
  }

  const handleSubmitReview = async () => {
    if (!userRating || !comment.trim()) {
      toast.error('Пожалуйста, выберите оценку и напишите отзыв')
      return
    }

    if (!user) {
      toast.error('Необходимо войти в систему для написания отзыва')
      navigate('/login')
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/${id}/reviews`, {
        method: editingReviewId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: userRating,
          comment: comment.trim(),
          reviewId: editingReviewId,
        }),
      })

      if (response.ok) {
        toast.success(editingReviewId ? 'Отзыв обновлен' : 'Отзыв добавлен')
        setUserRating(0)
        setComment('')
        setIsWritingReview(false)
        setEditingReviewId(null)
        loadReviews()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка при сохранении отзыва')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Ошибка при сохранении отзыва')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      return
    }

    const review = reviews.find(r => r.id === reviewId)
    if (review && review.userId !== user.id?.toString() && user.role !== 'admin') {
      toast.error('Вы можете удалить только свой отзыв')
      return
    }

    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/${id}/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Отзыв удален')
        loadReviews()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка при удалении отзыва')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Ошибка при удалении отзыва')
    }
  }

  const handleEditReview = (review: Review) => {
    if (!user || review.userId !== user.id?.toString()) {
      toast.error('Вы можете редактировать только свой отзыв')
      return
    }
    setUserRating(review.rating)
    setComment(review.comment)
    setIsWritingReview(true)
    setEditingReviewId(review.id)
  }

  const handleSubmitEmployerResponse = async (reviewId: string) => {
    const responseText = employerResponse[reviewId]?.trim()
    if (!responseText) {
      toast.error('Введите ответ на отзыв')
      return
    }

    if (!user || user.role !== 'employer') {
      toast.error('Только работодатели могут отвечать на отзывы')
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/${id}/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: responseText }),
      })

      if (response.ok) {
        toast.success('Ответ добавлен')
        setEmployerResponse({ ...employerResponse, [reviewId]: '' })
        loadReviews()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка при добавлении ответа')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      toast.error('Ошибка при добавлении ответа')
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, onClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1
      const isFilled = interactive
        ? starValue <= (hoveredRating || userRating)
        : starValue <= Math.round(rating)
      return (
        <Star
          key={index}
          className={`h-6 w-6 ${
            isFilled
              ? 'text-accent-gold fill-accent-gold'
              : 'text-gray-600'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onClick && onClick(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      )
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title={companyName}
        subtitle={`Средняя оценка: ${averageRating.toFixed(1)} из 5.0 (${reviews.length} ${reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'})`}
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        {/* Форма написания/редактирования отзыва */}
        <Card className="mb-8 scroll-animate-item">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingReviewId ? 'Редактировать отзыв' : 'Написать отзыв'}
            </h3>
            
            {/* Звезды для оценки */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Ваша оценка:</label>
              <div className="flex items-center gap-2">
                {renderStars(userRating, true, handleStarClick)}
                {userRating > 0 && (
                  <span className="ml-2 text-gray-400">{userRating} из 5</span>
                )}
              </div>
            </div>

            {/* Текст отзыва */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Ваш отзыв:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поделитесь своим опытом работы в этой компании..."
                className="w-full p-4 bg-dark-surface border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan resize-none"
                rows={5}
              />
            </div>

            {/* Кнопки */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmitReview}
                disabled={!userRating || !comment.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {editingReviewId ? 'Сохранить изменения' : 'Отправить отзыв'}
              </button>
              {(isWritingReview || editingReviewId) && (
                <button
                  onClick={() => {
                    setIsWritingReview(false)
                    setEditingReviewId(null)
                    setUserRating(0)
                    setComment('')
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Отмена
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Список отзывов */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-400">Пока нет отзывов о этой компании</p>
            </Card>
          ) : (
            reviews.map((review, index) => (
              <Card
                key={review.id}
                className="scroll-animate-item"
                style={{ transitionDelay: `${index * 0.05}s` }}
              >
                <div className="p-6">
                  {/* Заголовок отзыва */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold">{review.userName}</span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">{formatDate(review.createdAt)}</span>
                    </div>
                    {user && (review.userId === user.id?.toString() || user.role === 'admin') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-accent-cyan hover:text-accent-gold transition-colors"
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Текст отзыва */}
                  <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>

                  {/* Ответ работодателя */}
                  {review.employerResponse && (
                    <div className="mt-4 p-4 bg-dark-surface rounded-lg border-l-4 border-accent-cyan">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-accent-cyan font-semibold">Ответ компании:</span>
                        <span className="text-gray-400 text-sm">
                          {review.employerResponseCreatedAt && formatDate(review.employerResponseCreatedAt)}
                        </span>
                      </div>
                      <p className="text-gray-300">{review.employerResponse}</p>
                    </div>
                  )}

                  {/* Форма ответа работодателя */}
                  {user && user.role === 'employer' && !review.employerResponse && (
                    <div className="mt-4 p-4 bg-dark-surface rounded-lg">
                      <label className="block text-gray-300 mb-2">Ответить на отзыв:</label>
                      <textarea
                        value={employerResponse[review.id] || ''}
                        onChange={(e) =>
                          setEmployerResponse({ ...employerResponse, [review.id]: e.target.value })
                        }
                        placeholder="Напишите ответ на этот отзыв..."
                        className="w-full p-3 bg-dark-card border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan resize-none mb-2"
                        rows={3}
                      />
                      <button
                        onClick={() => handleSubmitEmployerResponse(review.id)}
                        className="btn-primary text-sm"
                      >
                        Отправить ответ
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Section>
    </div>
  )
}

export default CompanyDetails

