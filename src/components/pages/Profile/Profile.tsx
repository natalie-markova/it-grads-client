import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Edit, Trash2, X, Send, MoreVertical } from 'lucide-react'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { User, OutletContext } from '../../../types'

interface Profile {
  photo: string
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  city: string
  education: string
  experience: string
  about: string
}

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedDate: string
}

interface Chat {
  id: string
  employerName: string
  company: string
  lastMessage: string
  lastMessageTime: string
  messages: Message[]
}

interface Message {
  id: string
  text: string
  sender: 'graduate' | 'employer'
  timestamp: string
  isEdited?: boolean
}

interface ProfileEditFormProps {
  profile: Profile
  onSave: (profile: Profile) => void
  onCancel: () => void
}

const ProfileEditForm = ({ profile, onSave, onCancel }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<Profile>(profile)

  useEffect(() => {
    setFormData(profile)
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Фото (URL)</label>
        <input
          type="text"
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          className="input-field"
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Фамилия</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Имя</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Отчество</label>
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Дата рождения</label>
          <input
            type="text"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="input-field"
            placeholder="Например: 01.01.2000"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Город</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Образование</label>
        <input
          type="text"
          value={formData.education}
          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Опыт работы</label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">О себе</label>
        <textarea
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          className="input-field"
          rows={4}
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Сохранить
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Отмена
        </button>
      </div>
    </form>
  )
}

const GraduateProfile = () => {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [chats, setChats] = useState<Chat[]>([])

  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user?.role !== 'graduate') {
      navigate('/login')
      return
    }
    loadProfile()
    loadApplications()
    loadChats()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/profile/graduate`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProfile({
          photo: data.photo || '',
          lastName: data.lastName || '',
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          birthDate: data.birthDate || '',
          city: data.city || '',
          education: data.education || '',
          experience: data.experience || '',
          about: data.about || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadApplications = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/applications`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.map((app: any) => ({
          id: app.id.toString(),
          jobTitle: app.title,
          company: app.company,
          appliedDate: app.applied_at,
        })))
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const loadChats = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setChats(data.map((chat: any) => ({
          id: chat.id.toString(),
          employerName: chat.other_user_name || '',
          company: chat.company || '',
          lastMessage: chat.last_message || '',
          lastMessageTime: chat.last_message_time || '',
          messages: [],
        })))
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const handleSaveProfile = async (newProfile: Profile) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/profile/graduate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProfile)
      })
      if (response.ok) {
        const updatedProfile = await response.json()
        const savedProfile = {
          photo: updatedProfile.photo || '',
          lastName: updatedProfile.lastName || '',
          firstName: updatedProfile.firstName || '',
          middleName: updatedProfile.middleName || '',
          birthDate: updatedProfile.birthDate || '',
          city: updatedProfile.city || '',
          education: updatedProfile.education || '',
          experience: updatedProfile.experience || '',
          about: updatedProfile.about || '',
        }
        setIsEditingProfile(false)
        // Reload profile to ensure it's saved
        await loadProfile()
        setProfile(savedProfile)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка сохранения' }))
        alert(errorData.error || 'Ошибка при сохранении профиля')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    if (confirm('Вы уверены, что хотите удалить профиль?')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/profile/graduate`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (response.ok) {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error deleting profile:', error)
      }
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setApplications(applications.filter(app => app.id !== id))
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const handleDeleteChat = async (id: string) => {
    if (!user) return
    if (!confirm('Вы уверены, что хотите удалить этот чат?')) return
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== id))
        if (selectedChat === id) {
          setSelectedChat(null)
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/${chatId}/messages`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const messages = data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.text,
          sender: msg.sender_type === 'graduate' ? 'graduate' : 'employer',
          timestamp: new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          isEdited: msg.is_edited || false,
        }))
        
        setChats(chats.map(chat =>
          chat.id === chatId ? { ...chat, messages } : chat
        ))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  useEffect(() => {
    if (selectedChat && user) {
      loadChatMessages(selectedChat)
    }
  }, [selectedChat, user])

  const handleSendMessage = async (chatId: string) => {
    if (!messageText.trim() || !user) return

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: messageText })
      })
      if (response.ok) {
        setMessageText('')
        loadChatMessages(chatId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleEditMessage = async (chatId: string, messageId: string, newText: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: newText })
      })
      if (response.ok) {
        setEditingMessageId(null)
        loadChatMessages(chatId)
      }
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }

  const handleDeleteMessage = async (chatId: string, messageId: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        loadChatMessages(chatId)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const selectedChatData = chats.find(c => c.id === selectedChat)
  useScrollAnimation()

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <Section title="Личный кабинет выпускника" className="bg-dark-bg py-0 scroll-animate-item">
          {profile ? (
            <Card>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Профиль</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="p-2 text-accent-cyan hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isEditingProfile ? (
                <ProfileEditForm
                  profile={profile}
                  onSave={handleSaveProfile}
                  onCancel={() => setIsEditingProfile(false)}
                />
              ) : (
                <div className="space-y-6">
                  {/* Photo and Name Section */}
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Photo */}
                    <div className="w-full md:w-48 h-48 bg-dark-surface rounded-xl overflow-hidden border border-dark-surface flex items-center justify-center">
                      {profile.photo ? (
                        <img 
                          src={profile.photo} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-4xl text-gray-400">👤</span>
                      )}
                    </div>
                    
                    {/* Name Section */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-1">Фамилия</label>
                        <p className="text-white text-lg font-semibold">
                          {profile.lastName || 'Не указано'}
                        </p>
                      </div>
                      <div>
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-1">Имя</label>
                        <p className="text-white text-lg font-semibold">
                          {profile.firstName || 'Не указано'}
                        </p>
                      </div>
                      <div>
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-1">Отчество</label>
                        <p className="text-white text-lg font-semibold">
                          {profile.middleName || 'Не указано'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Information Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    {profile.birthDate && (
                      <div className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-colors">
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-2">Дата рождения</label>
                        <p className="text-white text-base">
                          {profile.birthDate.includes('T') 
                            ? new Date(profile.birthDate).toLocaleDateString('ru-RU', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                              })
                            : profile.birthDate}
                        </p>
                      </div>
                    )}

                    {/* City */}
                    {profile.city && (
                      <div className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-colors">
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-2">Город</label>
                        <p className="text-white text-base">{profile.city}</p>
                      </div>
                    )}

                    {/* Education */}
                    {profile.education && (
                      <div className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-colors md:col-span-2">
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-2">Образование</label>
                        <p className="text-white text-base leading-relaxed">{profile.education}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {profile.experience && (
                      <div className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-colors md:col-span-2">
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-2">Опыт работы</label>
                        <p className="text-white text-base leading-relaxed">{profile.experience}</p>
                      </div>
                    )}

                    {/* About */}
                    {profile.about && (
                      <div className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-colors md:col-span-2">
                        <label className="text-[#b0b0b0] text-sm font-medium block mb-2">О себе</label>
                        <p className="text-white text-base leading-relaxed">{profile.about}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-gray-300 mb-4">Профиль не заполнен</p>
              <button onClick={() => setIsEditingProfile(true)} className="btn-primary">
                Создать профиль
              </button>
            </Card>
          )}
        </Section>

        {/* Applications Section */}
        <Section title="Мои отклики" className="bg-dark-bg py-0 scroll-animate-item">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <Card key={app.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{app.jobTitle}</h3>
                      <p className="text-gray-300 mb-1">Компания: {app.company}</p>
                      <p className="text-gray-400 text-sm">Отклик отправлен: {app.appliedDate}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-300">У вас пока нет откликов</p>
            </Card>
          )}
        </Section>

        {/* Chats Section */}
        <Section title="Чаты с работодателями" className="bg-dark-bg py-0 scroll-animate-item">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <Card className="scroll-fade-left">
                <h3 className="text-xl font-semibold text-white mb-4">Чаты</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {chats.map((chat, index) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat === chat.id ? 'bg-dark-surface' : 'hover:bg-dark-surface'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-medium">{chat.employerName}</p>
                          <p className="text-gray-400 text-sm">{chat.company}</p>
                          <p className="text-gray-500 text-xs mt-1 truncate">{chat.lastMessage}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChat(chat.id)
                          }}
                          className="p-1 text-red-400 hover:bg-dark-card rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{chat.lastMessageTime}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              {selectedChatData ? (
                <Card className="scroll-fade-right">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedChatData.employerName}</h3>
                      <p className="text-gray-400 text-sm">{selectedChatData.company}</p>
                    </div>
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-2 text-gray-400 hover:bg-dark-surface rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="h-96 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
                    {selectedChatData.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'graduate' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                            msg.sender === 'graduate'
                              ? 'bg-accent-cyan text-dark-bg'
                              : 'bg-dark-surface text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm">{msg.text}</p>
                            {msg.sender === 'graduate' && (
                              <div className="flex gap-1">
                                {editingMessageId === msg.id ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        const newText = prompt('Редактировать сообщение:', msg.text)
                                        if (newText) {
                                          handleEditMessage(selectedChatData.id, msg.id, newText)
                                        }
                                      }}
                                      className="p-1 hover:bg-accent-blue rounded"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => setEditingMessageId(null)}
                                      className="p-1 hover:bg-accent-blue rounded"
                                    >
                                      ✕
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingMessageId(msg.id)}
                                      className="p-1 hover:bg-accent-blue rounded"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage(selectedChatData.id, msg.id)}
                                      className="p-1 hover:bg-accent-blue rounded"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs opacity-70">{msg.timestamp}</span>
                            {msg.isEdited && <span className="text-xs opacity-70">(изменено)</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedChatData.id)}
                      placeholder="Введите сообщение..."
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => handleSendMessage(selectedChatData.id)}
                      className="btn-primary"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <p className="text-gray-300 text-center">Выберите чат для просмотра сообщений</p>
                </Card>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default GraduateProfile

