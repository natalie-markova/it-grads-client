import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, X, Plus, Shield, Search, User as UserIcon, Calendar, Eye, Clock, Video, MapPin, Phone } from 'lucide-react'
import Card from '../../ui/Card'
import { $api } from '../../../utils/axios.instance'
import toast from 'react-hot-toast'
import ConfirmModal from '../../ui/ConfirmModal'
import { getImageUrl } from '../../../utils/image.utils'

interface Access {
  id: number
  graduateId: number
  employerId: number | null
  isActive: boolean
  employer?: {
    id: number
    username: string
    companyName?: string
    avatar?: string
    companyDescription?: string
  }
  graduate?: {
    id: number
    username: string
    firstName?: string
    lastName?: string
    avatar?: string
    email?: string
  }
  createdAt: string
}

interface Employer {
  id: number
  username: string
  companyName?: string
  avatar?: string
  companyDescription?: string
}

interface Graduate {
  id: number
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  email?: string
}

interface InterviewTrackerAccessProps {
  userRole: 'graduate' | 'employer'
  userId: number
}

const InterviewTrackerAccess: React.FC<InterviewTrackerAccessProps> = ({ userRole, userId }) => {
  const { t } = useTranslation()
  const [accesses, setAccesses] = useState<Access[]>([])
  const [grantedByMe, setGrantedByMe] = useState<Access[]>([])
  const [grantedToMe, setGrantedToMe] = useState<Access[]>([])
  const [employers, setEmployers] = useState<Employer[]>([])
  const [graduates, setGraduates] = useState<Graduate[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null; name: string }>({ 
    isOpen: false, 
    id: null,
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [viewingCalendar, setViewingCalendar] = useState<{ isOpen: boolean; userId: number | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: ''
  })
  const [calendarInterviews, setCalendarInterviews] = useState<any[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(false)

  useEffect(() => {
    loadAccesses()
    if (userRole === 'graduate') {
      loadEmployers()
    } else {
      loadGraduates()
    }
  }, [userRole])

  const loadAccesses = async () => {
    setLoading(true)
    try {
      const response = await $api.get('/interview-tracker/access')
      // Для работодателя ответ содержит два списка: grantedByMe и grantedToMe
      if (userRole === 'employer' && response.data.grantedByMe && response.data.grantedToMe) {
        // Объединяем оба списка для отображения
        setAccesses([...response.data.grantedByMe, ...response.data.grantedToMe])
        // Сохраняем разделенные списки для отображения
        setGrantedByMe(response.data.grantedByMe)
        setGrantedToMe(response.data.grantedToMe)
      } else {
        // Для выпускника ответ - обычный массив
        setAccesses(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading accesses:', error)
      toast.error('Ошибка при загрузке списка доступа')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployers = async () => {
    try {
      const response = await $api.get('/user/employers')
      setEmployers(response.data)
    } catch (error) {
      console.error('Error loading employers:', error)
      toast.error('Ошибка при загрузке списка компаний')
    }
  }

  const loadGraduates = async () => {
    try {
      const response = await $api.get('/user/graduates')
      console.log('Loaded graduates:', response.data.length, response.data)
      setGraduates(response.data)
    } catch (error) {
      console.error('Error loading graduates:', error)
      toast.error('Ошибка при загрузке списка выпускников')
    }
  }


  const handleAddAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) {
      toast.error(userRole === 'graduate' ? 'Выберите компанию' : 'Выберите выпускника')
      return
    }

    try {
      await $api.post('/interview-tracker/access', { targetId: Number(selectedId) })
      toast.success('Доступ предоставлен')
      loadAccesses()
      setIsModalOpen(false)
      setSelectedId('')
      setSearchQuery('')
    } catch (error: any) {
      console.error('Error adding access:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при предоставлении доступа'
      toast.error(errorMessage)
    }
  }

  const handleDeleteAccess = (id: number, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      await $api.delete(`/interview-tracker/access/${deleteConfirm.id}`)
      toast.success('Доступ запрещен')
      loadAccesses()
      setDeleteConfirm({ isOpen: false, id: null, name: '' })
    } catch (error: any) {
      console.error('Error deleting access:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при запрете доступа'
      toast.error(errorMessage)
    }
  }

  const handleViewCalendar = async (userId: number, userName: string) => {
    setViewingCalendar({ isOpen: true, userId, userName })
    setLoadingCalendar(true)
    try {
      const response = await $api.get(`/interview-tracker/access/${userId}/calendar`)
      setCalendarInterviews(response.data)
    } catch (error: any) {
      console.error('Error loading calendar:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при загрузке календаря'
      toast.error(errorMessage)
      setViewingCalendar({ isOpen: false, userId: null, userName: '' })
    } finally {
      setLoadingCalendar(false)
    }
  }

  // Фильтрация по первой букве или поиск
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase().trim()
    
    if (userRole === 'graduate') {
      // Получаем уже добавленные ID
      const addedEmployerIds = new Set(accesses.map(a => a.employerId).filter(Boolean))
      
      // Исключаем уже добавленных из всех компаний
      let availableEmployers = employers.filter(employer => !addedEmployerIds.has(employer.id))
      
      // Если есть поисковый запрос, фильтруем
      if (query.length > 0) {
        availableEmployers = availableEmployers.filter(employer => {
          const companyName = (employer.companyName || employer.username || '').toLowerCase()
          // Если введена только одна буква - ищем по первой букве
          if (query.length === 1) {
            return companyName.length > 0 && companyName[0] === query[0]
          }
          // Если больше одной буквы - обычный поиск по вхождению
          return companyName.includes(query)
        })
      }
      
      // Сортируем по названию
      return availableEmployers.sort((a, b) => {
        const nameA = (a.companyName || a.username || '').toLowerCase()
        const nameB = (b.companyName || b.username || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
    } else {
      // Получаем уже добавленные ID
      const addedGraduateIds = new Set(accesses.map(a => a.graduateId))
      
      // Исключаем уже добавленных из всех выпускников
      let availableGraduates = graduates.filter(graduate => !addedGraduateIds.has(graduate.id))
      
      // Если есть поисковый запрос, фильтруем
      if (query.length > 0) {
        availableGraduates = availableGraduates.filter(graduate => {
          const lastName = (graduate.lastName || '').toLowerCase()
          const firstName = (graduate.firstName || '').toLowerCase()
          const username = (graduate.username || '').toLowerCase()
          const fullName = `${lastName} ${firstName}`.trim().toLowerCase()
          
          // Если введена только одна буква - ищем по первой букве фамилии, имени или username
          if (query.length === 1) {
            return (lastName.length > 0 && lastName[0] === query[0]) ||
                   (firstName.length > 0 && firstName[0] === query[0]) ||
                   (username.length > 0 && username[0] === query[0])
          }
          // Если больше одной буквы - обычный поиск по вхождению в фамилию, имя, username или полное имя
          return lastName.includes(query) || 
                 firstName.includes(query) || 
                 username.includes(query) ||
                 fullName.includes(query)
        })
      }
      
      // Сортируем по фамилии, затем по имени
      return availableGraduates.sort((a, b) => {
        const lastNameA = (a.lastName || a.username || '').toLowerCase()
        const lastNameB = (b.lastName || b.username || '').toLowerCase()
        if (lastNameA !== lastNameB) {
          return lastNameA.localeCompare(lastNameB)
        }
        const firstNameA = (a.firstName || '').toLowerCase()
        const firstNameB = (b.firstName || '').toLowerCase()
        return firstNameA.localeCompare(firstNameB)
      })
    }
  }

  const filteredItems = getFilteredItems()
  
  // Отладочная информация для выпускников
  useEffect(() => {
    if (userRole === 'employer') {
      console.log('=== DEBUG INFO ===')
      console.log('Search query:', searchQuery)
      console.log('All graduates count:', graduates.length)
      console.log('Accesses count:', accesses.length)
      console.log('Filtered items count:', filteredItems.length)
      if (searchQuery && filteredItems.length === 0 && graduates.length > 0) {
        console.log('Sample graduate:', graduates[0])
        const sample = graduates[0]
        console.log('Sample lastName:', sample.lastName)
        console.log('Sample firstName:', sample.firstName)
        console.log('Sample username:', sample.username)
      }
      if (filteredItems.length > 0) {
        console.log('First filtered item:', filteredItems[0])
      }
    }
  }, [searchQuery, graduates, filteredItems, userRole, accesses])

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-accent-cyan" />
            <h2 className="text-xl font-semibold text-white">
              {userRole === 'graduate' ? 'Управление доступом к календарю' : 'Управление доступом к календарю'}
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {userRole === 'graduate' ? 'Добавить компанию' : 'Добавить выпускника'}
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          {userRole === 'graduate' 
            ? 'Разрешите компаниям видеть ваш календарь собеседований. Вы можете в любой момент запретить доступ.'
            : 'Разрешите выпускникам видеть ваш календарь собеседований. Вы можете в любой момент запретить доступ.'}
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Загрузка...</div>
        ) : (userRole === 'employer' ? (
          // Для работодателя показываем два отдельных списка
          <>
            {grantedByMe.length === 0 && grantedToMe.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Нет выпускников с доступом</p>
                <p className="text-gray-500 text-sm">
                  Добавьте выпускника, чтобы разрешить ему видеть ваш календарь собеседований
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Выпускники, которым я разрешаю доступ */}
                {grantedByMe.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent-cyan" />
                      Выпускники, которым я разрешаю доступ
                    </h3>
                    <div className="space-y-3">
                      {grantedByMe.map((access) => {
                        const displayItem = access.graduate
                        const displayName = displayItem?.lastName && displayItem?.firstName 
                          ? `${displayItem.lastName} ${displayItem.firstName}`
                          : displayItem?.username || ''

                        return (
                          <div
                            key={access.id}
                            className="bg-dark-surface border border-dark-card rounded-lg p-4 flex items-center justify-between hover:border-accent-cyan/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {displayItem?.avatar ? (
                                <img 
                                  src={getImageUrl(displayItem.avatar)} 
                                  alt={displayName}
                                  className="w-12 h-12 rounded-lg object-cover border border-dark-card"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-dark-card flex items-center justify-center border border-dark-card">
                                  <UserIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  {displayName}
                                </div>
                                {displayItem?.email && (
                                  <div className="text-gray-400 text-sm mt-1">
                                    {displayItem.email}
                                  </div>
                                )}
                                <div className="text-gray-500 text-xs mt-1">
                                  Доступ предоставлен {new Date(access.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                              </div>
                              {access.isActive && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                                  Активен
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {displayItem && (
                                <button
                                  onClick={() => handleViewCalendar(displayItem.id, displayName)}
                                  className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                                  title="Просмотреть календарь"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAccess(access.id, displayName)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Запретить доступ"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Выпускники, которые разрешили доступ мне */}
                {grantedToMe.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent-purple" />
                      Выпускники, которые разрешили доступ мне
                    </h3>
                    <div className="space-y-3">
                      {grantedToMe.map((access) => {
                        const displayItem = access.graduate
                        const displayName = displayItem?.lastName && displayItem?.firstName 
                          ? `${displayItem.lastName} ${displayItem.firstName}`
                          : displayItem?.username || ''

                        return (
                          <div
                            key={access.id}
                            className="bg-dark-surface border border-dark-card rounded-lg p-4 flex items-center justify-between hover:border-accent-purple/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {displayItem?.avatar ? (
                                <img 
                                  src={getImageUrl(displayItem.avatar)} 
                                  alt={displayName}
                                  className="w-12 h-12 rounded-lg object-cover border border-dark-card"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-dark-card flex items-center justify-center border border-dark-card">
                                  <UserIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  {displayName}
                                </div>
                                {displayItem?.email && (
                                  <div className="text-gray-400 text-sm mt-1">
                                    {displayItem.email}
                                  </div>
                                )}
                                <div className="text-gray-500 text-xs mt-1">
                                  Доступ предоставлен {new Date(access.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                              </div>
                              {access.isActive && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                                  Активен
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {displayItem && (
                                <button
                                  onClick={() => handleViewCalendar(displayItem.id, displayName)}
                                  className="p-2 text-accent-purple hover:bg-accent-purple/10 rounded-lg transition-colors"
                                  title="Просмотреть календарь"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAccess(access.id, displayName)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Запретить доступ"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // Для выпускника показываем обычный список
          accesses.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Нет компаний с доступом</p>
              <p className="text-gray-500 text-sm">
                Добавьте компанию, чтобы разрешить ей видеть ваш календарь собеседований
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accesses.map((access) => {
                const displayItem = access.employer
                const displayName = displayItem?.companyName || displayItem?.username || ''

                return (
                  <div
                    key={access.id}
                    className="bg-dark-surface border border-dark-card rounded-lg p-4 flex items-center justify-between hover:border-accent-cyan/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {displayItem?.avatar ? (
                        <img 
                          src={getImageUrl(displayItem.avatar)} 
                          alt={displayName}
                          className="w-12 h-12 rounded-lg object-cover border border-dark-card"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-dark-card flex items-center justify-center border border-dark-card">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {displayName}
                        </div>
                        {displayItem?.companyDescription && (
                          <div className="text-gray-400 text-sm mt-1 line-clamp-1">
                            {displayItem.companyDescription}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-1">
                          Доступ предоставлен {new Date(access.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      {access.isActive && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                          Активен
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {displayItem && (
                        <button
                          onClick={() => handleViewCalendar(displayItem.id, displayName)}
                          className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                          title="Просмотреть календарь"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAccess(access.id, displayName)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Запретить доступ"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ))}
      </Card>

      {/* Модальное окно добавления */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {userRole === 'graduate' ? 'Добавить компанию' : 'Добавить выпускника'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedId('')
                    setSearchQuery('')
                  }}
                  className="p-2 hover:bg-dark-surface rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddAccess} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {userRole === 'graduate' 
                      ? 'Поиск компании (введите первую букву или название)'
                      : 'Поиск выпускника (введите первую букву фамилии или имя/фамилию)'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg pl-10 pr-4 py-2 text-white"
                      placeholder={userRole === 'graduate' 
                        ? 'Введите первую букву или название компании...'
                        : 'Введите первую букву фамилии или имя/фамилию...'}
                    />
                  </div>
                </div>

                {searchQuery && filteredItems.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {userRole === 'graduate' ? 'Выберите компанию' : 'Выберите выпускника'} ({filteredItems.length})
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-dark-card rounded-lg bg-dark-surface custom-scrollbar">
                      {filteredItems.map((item) => {
                        const itemId = userRole === 'graduate' ? (item as Employer).id : (item as Graduate).id
                        const itemName = userRole === 'graduate' 
                          ? ((item as Employer).companyName || (item as Employer).username)
                          : ((item as Graduate).lastName && (item as Graduate).firstName
                              ? `${(item as Graduate).lastName} ${(item as Graduate).firstName}`
                              : (item as Graduate).username)

                        return (
                          <div
                            key={itemId}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-dark-card transition-colors
                              ${selectedId === String(itemId) ? 'bg-dark-card border-l-4 border-accent-cyan' : ''}`}
                            onClick={() => setSelectedId(String(itemId))}
                          >
                            {item.avatar ? (
                              <img 
                                src={getImageUrl(item.avatar)} 
                                alt={itemName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center">
                                {userRole === 'graduate' ? (
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <UserIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            )}
                            <div>
                              <div className="text-white text-sm font-medium">
                                {itemName}
                              </div>
                              {userRole === 'graduate' && (item as Employer).companyDescription && (
                                <div className="text-gray-400 text-xs line-clamp-1">
                                  {(item as Employer).companyDescription}
                                </div>
                              )}
                              {userRole === 'employer' && (item as Graduate).email && (
                                <div className="text-gray-400 text-xs">
                                  {(item as Graduate).email}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!searchQuery && (
                  <p className="text-gray-500 text-sm">
                    {userRole === 'graduate' 
                      ? 'Введите первую букву названия компании или название для поиска'
                      : 'Введите первую букву фамилии или имя/фамилию для поиска'}
                  </p>
                )}
                {searchQuery && filteredItems.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    {userRole === 'graduate' 
                      ? 'Компании по вашему запросу не найдены или уже имеют доступ.'
                      : 'Выпускники по вашему запросу не найдены или уже имеют доступ.'}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setSelectedId('')
                      setSearchQuery('')
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!selectedId}
                  >
                    Разрешить доступ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={`Запретить доступ для ${deleteConfirm.name}?`}
        message={`Вы уверены, что хотите запретить доступ? ${userRole === 'graduate' ? 'Компания' : 'Выпускник'} больше не сможет просматривать ваш календарь собеседований.`}
        confirmText="Запретить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
      />

      {/* Модальное окно просмотра календаря */}
      {viewingCalendar.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-shrink-0 border-b border-dark-card">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-accent-cyan" />
                  <h2 className="text-2xl font-bold text-white">
                    Календарь собеседований: {viewingCalendar.userName}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setViewingCalendar({ isOpen: false, userId: null, userName: '' })
                    setCalendarInterviews([])
                  }}
                  className="p-2 hover:bg-dark-surface rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingCalendar ? (
                <div className="text-center py-8 text-gray-400">Загрузка календаря...</div>
              ) : calendarInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Нет запланированных собеседований</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {calendarInterviews.map((interview: any) => {
                    const TypeIcon = interview.type === 'online' ? Video : interview.type === 'offline' ? MapPin : Phone
                    const statusColor = interview.status === 'scheduled' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : interview.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'

                    return (
                      <Card key={interview.id} className="hover:border-accent-cyan/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <Building2 className="h-5 w-5 text-accent-cyan" />
                              <h3 className="text-lg font-semibold text-white">{interview.company}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs border ${statusColor}`}>
                                {interview.status === 'scheduled' ? 'Запланировано' : 
                                 interview.status === 'completed' ? 'Завершено' : 'Отменено'}
                              </span>
                            </div>
                            <p className="text-gray-400 mb-2">{interview.position}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(interview.date).toLocaleDateString('ru-RU')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {interview.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <TypeIcon className="h-4 w-4" />
                                {interview.type === 'online' ? 'Онлайн' : interview.type === 'offline' ? 'Офис' : 'Телефон'}
                              </span>
                            </div>
                            {interview.notes && (
                              <p className="mt-2 text-sm text-gray-500 italic">📝 {interview.notes}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InterviewTrackerAccess

