import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { Star, Trash2, ArrowUpDown, Send, X, Edit2, Save } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'
import { $api } from '../../../utils/axios.instance'

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
  const [reviewsKey, setReviewsKey] = useState(0) // Ключ для принудительного ререндера
  
  const [employerResponse, setEmployerResponse] = useState<{ [key: string]: string }>({})
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null)
  const [editingResponseText, setEditingResponseText] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'positive-first' | 'negative-first' | 'date'>('positive-first')
  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState<string | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false)
  // Используем useRef для синхронного доступа к ID недавно добавленных отзывов
  const recentlyAddedReviewIdsRef = useRef<Set<string>>(new Set())
  // Храним сами отзывы в ref для доступа даже если они еще не в состоянии
  const optimisticReviewsRef = useRef<Map<string, Review>>(new Map())

  useEffect(() => {
    if (id) {
      loadCompanyDetails()
      // Используем skipIfOptimistic, чтобы не перезаписывать недавно добавленные отзывы
      loadReviews(false, true) // При первой загрузке пропускаем, если есть оптимистичные отзывы
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadCompanyDetails = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCompanyName(data.name || 'Компания')
      } else if (response.status === 404) {
        setCompanyName('Компания')
      }
    } catch (error) {
      setCompanyName('Компания')
    }
  }

  const loadReviews = async (preserveOptimistic = false, skipIfOptimistic = false) => {
    // Если skipIfOptimistic = true и есть оптимистично добавленные отзывы, пропускаем загрузку
    if (skipIfOptimistic && recentlyAddedReviewIdsRef.current.size > 0) {
      return;
    }
    
    // Если есть недавно добавленные отзывы и мы не сохраняем оптимистичные, все равно сохраняем их
    if (!preserveOptimistic && recentlyAddedReviewIdsRef.current.size > 0) {
      preserveOptimistic = true; // Автоматически сохраняем оптимистичные отзывы
    }
    try {
      // Используем правильный endpoint: /api/reviews/employer/:employerId
      const response = await $api.get(`/reviews/employer/${id}`)
      const data = response.data
      
      // Проверяем структуру ответа (может быть объект с reviews или массив)
      const reviewsData = data.reviews || data || []
      
      const serverReviews = reviewsData.map((review: any) => ({
        id: review.id.toString(),
        userId: (review.userId || review.user_id || review.reviewer?.id)?.toString() || '',
        userName: review.reviewer?.username || review.userName || review.user_name || 'Анонимный пользователь',
        rating: review.rating,
        comment: review.comment || '',
        createdAt: review.createdAt || review.created_at,
        employerResponse: review.employerResponse || review.employer_response,
        employerResponseCreatedAt: review.employerResponseCreatedAt || review.employer_response_created_at,
      }))
      
      // Всегда сохраняем недавно добавленные отзывы, которых еще нет на сервере
      setReviews(prevReviews => {
        const serverReviewIds = new Set(serverReviews.map(r => r.id))
        
        // Собираем оптимистичные отзывы из двух источников:
        // 1. Из prevReviews (если они уже там есть)
        const optimisticFromState = prevReviews.filter(r => {
          const isRecentlyAdded = recentlyAddedReviewIdsRef.current.has(r.id)
          const notOnServer = !serverReviewIds.has(r.id)
          return notOnServer && isRecentlyAdded
        })
        
        // 2. Из optimisticReviewsRef (если они еще не в состоянии)
        const optimisticFromRef: Review[] = []
        recentlyAddedReviewIdsRef.current.forEach(reviewId => {
          if (!serverReviewIds.has(reviewId)) {
            // Проверяем, есть ли этот отзыв в состоянии
            const inState = prevReviews.some(r => r.id === reviewId)
            if (!inState) {
              // Берем из ref
              const reviewFromRef = optimisticReviewsRef.current.get(reviewId)
              if (reviewFromRef) {
                optimisticFromRef.push(reviewFromRef)
              }
            }
          }
        })
        
        const allOptimistic = [...optimisticFromState, ...optimisticFromRef]
        
        // Объединяем: сначала оптимистичные, потом с сервера
        // Убираем дубликаты (если отзыв есть и в оптимистичных, и на сервере, берем с сервера)
        const mergedMap = new Map<string, Review>()
        
        // Сначала добавляем оптимистичные отзывы
        allOptimistic.forEach(review => {
          mergedMap.set(review.id, review)
        })
        
        // Затем добавляем отзывы с сервера (они перезапишут оптимистичные, если есть дубликаты)
        serverReviews.forEach(review => {
          mergedMap.set(review.id, review)
        })
        
        const merged = Array.from(mergedMap.values())
        
        // Если после объединения список пуст, но были оптимистичные отзывы, возвращаем их
        if (merged.length === 0 && allOptimistic.length > 0) {
          return allOptimistic
        }
        
        return merged
      })
    } catch (error: any) {
      // При ошибке сохраняем существующие отзывы, если они есть
      setReviews(prevReviews => preserveOptimistic ? prevReviews : [])
    }
  }



  // Проверяем, есть ли у текущего пользователя отзыв для этого работодателя
  const hasUserReview = user && user.role === 'graduate' && reviews.some(r => r.userId === user.id?.toString())
  
  const handleStarClick = (rating: number) => {
    setUserRating(rating)
    if (!isWritingReview && !hasUserReview) {
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

    // Проверяем, что только выпускники могут писать отзывы
    if (user.role !== 'graduate') {
      toast.error('Только выпускники могут оставлять отзывы')
      return
    }

    try {
      // Создание нового отзыва: POST /api/reviews
      const response = await $api.post('/reviews', {
        employerId: parseInt(id || '0'),
        rating: userRating,
        comment: comment.trim(),
      });
      
      toast.success('Отзыв добавлен')
      
      // Сразу добавляем новый отзыв в список для мгновенного отображения
      if (response.data) {
        const newReview: Review = {
          id: response.data.id.toString(),
          userId: (response.data.userId || response.data.reviewer?.id)?.toString() || '',
          userName: response.data.reviewer?.username || user?.username || 'Вы',
          rating: response.data.rating,
          comment: response.data.comment || '',
          createdAt: response.data.createdAt || new Date().toISOString(),
          employerResponse: response.data.employerResponse || null,
          employerResponseCreatedAt: response.data.employerResponseCreatedAt || null,
        };
        
        // КРИТИЧЕСКИ ВАЖНО: Сохраняем ID и сам отзыв в ref ПЕРЕД любыми обновлениями состояния
        // Это гарантирует, что если loadReviews() вызовется, он увидит этот отзыв
        recentlyAddedReviewIdsRef.current.add(newReview.id);
        optimisticReviewsRef.current.set(newReview.id, newReview);
        
        // Добавляем новый отзыв в начало списка немедленно
        // Используем функциональное обновление для гарантии сохранения
        setReviews(prevReviews => {
          // Проверяем, нет ли уже такого отзыва (по ID)
          const exists = prevReviews.some(r => r.id === newReview.id);
          if (exists) {
            // Если уже есть, обновляем его данными с сервера
            return prevReviews.map(r => r.id === newReview.id ? newReview : r);
          }
          // Добавляем новый отзыв в начало списка
          return [newReview, ...prevReviews];
        });
        
        // Моментально скрываем форму и очищаем поля (делаем это внутри блока if, чтобы гарантировать выполнение)
        setUserRating(0)
        setComment('')
        setIsWritingReview(false) // Скрываем форму сразу после успешного сохранения
        
        // Принудительно обновляем ключ для ререндера
        setReviewsKey(prev => prev + 1);
        
        // НЕ вызываем loadReviews() сразу - отзыв уже добавлен в список
        // Отзыв останется в списке, даже если loadReviews() будет вызван позже
        
        // Через 10 секунд удаляем ID и отзыв из ref (отзыв уже должен быть на сервере)
        // Но оставляем его в списке, так как он уже есть на сервере
        const reviewIdToDelete = newReview.id;
        setTimeout(() => {
          recentlyAddedReviewIdsRef.current.delete(reviewIdToDelete);
          optimisticReviewsRef.current.delete(reviewIdToDelete);
        }, 10000);
      } else {
        // Если response.data отсутствует, все равно скрываем форму
        setUserRating(0)
        setComment('')
        setIsWritingReview(false)
      }
      
      // Прокручиваем страницу к верхней части
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error submitting review:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при сохранении отзыва'
      toast.error(errorMessage)
    }
  }

  const handleDeleteReview = (reviewId: string) => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      return
    }

    const review = reviews.find(r => r.id === reviewId)
    if (review && review.userId !== user.id?.toString() && user.role !== 'admin') {
      toast.error('Вы можете удалить только свой отзыв')
      return
    }

    setDeleteConfirmReviewId(reviewId)
  }

  const confirmDeleteReview = async () => {
    if (!deleteConfirmReviewId) return

    // Находим удаляемый отзыв ДО удаления
    const deletedReview = reviews.find(r => r.id === deleteConfirmReviewId)
    const isUserReview = deletedReview && user && deletedReview.userId === user.id?.toString()

    try {
      // Моментально удаляем отзыв из списка (оптимистичное обновление)
      setReviews(prevReviews => prevReviews.filter(r => r.id !== deleteConfirmReviewId))
      
      // Если удален отзыв текущего пользователя, моментально показываем форму снова
      if (isUserReview) {
        setIsWritingReview(true)
      }
      
      setDeleteConfirmReviewId(null)
      toast.success('Отзыв удален')
      
      // Затем удаляем на сервере
      await $api.delete(`/reviews/${deleteConfirmReviewId}`)
      
      // Обновляем список с сервера для синхронизации
      loadReviews(false)
    } catch (error: any) {
      console.error('Error deleting review:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при удалении отзыва'
      toast.error(errorMessage)
      
      // В случае ошибки возвращаем отзыв в список
      if (deletedReview) {
        setReviews(prevReviews => {
          const exists = prevReviews.some(r => r.id === deletedReview.id)
          if (!exists) {
            return [deletedReview, ...prevReviews]
          }
          return prevReviews
        })
        
        // Если это был отзыв пользователя, скрываем форму обратно
        if (isUserReview) {
          setIsWritingReview(false)
        }
      }
    }
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
      // Моментально обновляем отзыв в списке (оптимистичное обновление)
      setReviews(prevReviews => 
        prevReviews.map(r => 
          r.id === reviewId 
            ? {
                ...r,
                employerResponse: responseText,
                employerResponseCreatedAt: new Date().toISOString()
              }
            : r
        )
      )
      
      // Затем отправляем на сервер
      const response = await $api.post(`/reviews/${reviewId}/response`, {
        response: responseText,
      })
      
      // Обновляем с данными с сервера
      if (response.data) {
        setReviews(prevReviews => 
          prevReviews.map(r => 
            r.id === reviewId 
              ? {
                  ...r,
                  employerResponse: response.data.employerResponse,
                  employerResponseCreatedAt: response.data.employerResponseCreatedAt
                }
              : r
          )
        )
      }
      
      toast.success('Ответ добавлен')
      setEmployerResponse({ ...employerResponse, [reviewId]: '' })
      setReviewsKey(prev => prev + 1) // Принудительный ререндер
    } catch (error: any) {
      console.error('Error submitting response:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при добавлении ответа'
      toast.error(errorMessage)
      
      // В случае ошибки обновляем список с сервера
      loadReviews(true)
    }
  }

  const handleEditEmployerResponse = (reviewId: string, currentResponse: string) => {
    setEditingResponseId(reviewId)
    setEditingResponseText(currentResponse)
  }

  const handleSaveEmployerResponse = async (reviewId: string) => {
    const responseText = editingResponseText.trim()
    if (!responseText) {
      toast.error('Введите ответ на отзыв')
      return
    }

    if (!user || user.role !== 'employer') {
      toast.error('Только работодатели могут редактировать ответы')
      return
    }

    try {
      // Моментально обновляем отзыв в списке (оптимистичное обновление)
      setReviews(prevReviews => 
        prevReviews.map(r => 
          r.id === reviewId 
            ? {
                ...r,
                employerResponse: responseText
              }
            : r
        )
      )
      
      // Затем отправляем на сервер
      const response = await $api.put(`/reviews/${reviewId}/response`, {
        response: responseText,
      })
      
      // Обновляем с данными с сервера
      if (response.data) {
        setReviews(prevReviews => 
          prevReviews.map(r => 
            r.id === reviewId 
              ? {
                  ...r,
                  employerResponse: response.data.employerResponse,
                  employerResponseCreatedAt: response.data.employerResponseCreatedAt
                }
              : r
          )
        )
      }
      
      toast.success('Ответ обновлен')
      setEditingResponseId(null)
      setEditingResponseText('')
      setReviewsKey(prev => prev + 1) // Принудительный ререндер
    } catch (error: any) {
      console.error('Error updating response:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при обновлении ответа'
      toast.error(errorMessage)
      
      // В случае ошибки обновляем список с сервера
      loadReviews(true)
    }
  }

  const handleDeleteEmployerResponse = async (reviewId: string) => {
    if (!user || user.role !== 'employer') {
      toast.error('Только работодатели могут удалять ответы')
      return
    }

    try {
      // Моментально удаляем ответ из отзыва (оптимистичное обновление)
      setReviews(prevReviews => 
        prevReviews.map(r => 
          r.id === reviewId 
            ? {
                ...r,
                employerResponse: undefined,
                employerResponseCreatedAt: undefined
              }
            : r
        )
      )
      
      // Затем удаляем на сервере
      await $api.delete(`/reviews/${reviewId}/response`)
      
      toast.success('Ответ удален')
      setReviewsKey(prev => prev + 1) // Принудительный ререндер
    } catch (error: any) {
      console.error('Error deleting response:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при удалении ответа'
      toast.error(errorMessage)
      
      // В случае ошибки обновляем список с сервера
      loadReviews(true)
    }
  }

  const handleCancelEditResponse = () => {
    setEditingResponseId(null)
    setEditingResponseText('')
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

  // Сортировка отзывов: сначала положительные, потом отрицательные, внутри группы - по дате (сначала новые)
  const sortedReviews = useMemo(() => {
    // Функция сортировки по дате (сначала новые)
    const sortByDate = (a: Review, b: Review) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA // Сначала новые
    }

    // Если выбрана сортировка по дате
    if (sortOrder === 'date') {
      return [...reviews].sort(sortByDate)
    }

    // Сортировка по рейтингу
    const positiveReviews = reviews.filter(review => review.rating >= 4)
    const negativeReviews = reviews.filter(review => review.rating < 4)

    positiveReviews.sort(sortByDate)
    negativeReviews.sort(sortByDate)

    return sortOrder === 'positive-first' 
      ? [...positiveReviews, ...negativeReviews]
      : [...negativeReviews, ...positiveReviews];
  }, [reviews, sortOrder])

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title={companyName}
        subtitle={`Средняя оценка: ${averageRating.toFixed(1)} из 5.0 (${reviews.length} ${reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'})`}
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        {/* Форма написания отзыва (только для выпускников, если у них еще нет отзыва) */}
        {user && user.role === 'graduate' && !hasUserReview && (
          <Card className="mb-8 scroll-animate-item">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Написать отзыв
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
                  Сохранить
                </button>
                {isWritingReview && (
                  <button
                    onClick={() => {
                      setIsWritingReview(false)
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
        )}

        {/* Список отзывов */}
        <div id="reviews-section" className="space-y-6" key={`reviews-${reviewsKey}`}>
          {sortedReviews.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-400">Пока нет отзывов о этой компании</p>
            </Card>
          ) : (
            <>
              {/* Селектор сортировки */}
              <Card className="scroll-animate-item">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ArrowUpDown className="h-5 w-5 text-accent-cyan" />
                    <span className="text-white font-medium">Сортировка отзывов:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSortOrder('positive-first')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sortOrder === 'positive-first'
                          ? 'bg-accent-cyan text-dark-bg'
                          : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
                      }`}
                    >
                      Сначала положительные
                    </button>
                    <button
                      onClick={() => setSortOrder('negative-first')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sortOrder === 'negative-first'
                          ? 'bg-accent-cyan text-dark-bg'
                          : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
                      }`}
                    >
                      Сначала отрицательные
                    </button>
                    <button
                      onClick={() => setSortOrder('date')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sortOrder === 'date'
                          ? 'bg-accent-cyan text-dark-bg'
                          : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
                      }`}
                    >
                      По дате добавления
                    </button>
                  </div>
                </div>
              </Card>

              {sortedReviews.map((review, index) => (
              <Card
                key={`review-${review.id}-${reviewsKey}`}
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

                  {/* Ответ работодателя - показываем либо ответ, либо форму редактирования */}
                  {review.employerResponse ? (
                    editingResponseId === review.id ? (
                      // Форма редактирования ответа (как в профиле работодателя)
                      <div className="mt-4 p-4 bg-dark-surface rounded-lg border-l-4 border-accent-cyan">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-accent-cyan font-semibold">Редактировать ответ:</label>
                        </div>
                        <textarea
                          value={editingResponseText}
                          onChange={(e) => setEditingResponseText(e.target.value)}
                          placeholder="Напишите ответ на этот отзыв..."
                          className="w-full p-3 bg-dark-card border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan resize-none mb-4"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEmployerResponse(review.id)}
                            className="btn-primary text-sm flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Сохранить
                          </button>
                          <button
                            onClick={handleCancelEditResponse}
                            className="px-6 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors text-sm"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Отображение ответа (как просмотр профиля работодателя)
                      <div className="mt-4 p-4 bg-dark-surface rounded-lg border-l-4 border-accent-cyan">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-accent-cyan font-semibold">Ответ компании:</span>
                            <span className="text-gray-400 text-sm">
                              {review.employerResponseCreatedAt && formatDate(review.employerResponseCreatedAt)}
                            </span>
                          </div>
                          {user && user.role === 'employer' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditEmployerResponse(review.id, review.employerResponse || '')}
                                className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
                                title="Редактировать ответ"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployerResponse(review.id)}
                                className="p-2 text-red-400 hover:bg-dark-card rounded-lg transition-colors"
                                title="Удалить ответ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{review.employerResponse}</p>
                      </div>
                    )
                  ) : null}

                  {/* Форма ответа работодателя */}
                  {user && user.role === 'employer' && !review.employerResponse && editingResponseId !== review.id && (
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
              ))}
            </>
          )}
        </div>
      </Section>

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirmReviewId && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
          onClick={() => setDeleteConfirmReviewId(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Card 
            className="max-w-md w-full"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Подтверждение удаления
              </h3>
              <p className="text-gray-300 mb-6">
                Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteReview}
                  className="btn-primary flex-1"
                >
                  Удалить
                </button>
                <button
                  onClick={() => setDeleteConfirmReviewId(null)}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CompanyDetails

