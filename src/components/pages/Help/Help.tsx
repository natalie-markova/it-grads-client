import { useState } from 'react'
import { Send, Mail, MessageCircle } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const Help = () => {
  useScrollAnimation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет отправка формы на сервер
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section title="Помощь и поддержка" subtitle="Свяжитесь с нами, если у вас возникли вопросы" className="bg-dark-bg py-0 scroll-animate-item">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Contact Form */}
          <Card className="scroll-fade-left">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-accent-cyan" />
              Форма обратной связи
            </h3>
            {submitted ? (
              <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
                Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Тема обращения
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Выберите тему</option>
                    <option value="technical">Техническая проблема</option>
                    <option value="account">Вопрос по аккаунту</option>
                    <option value="feature">Предложение по функционалу</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Опишите вашу проблему или вопрос..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send className="h-5 w-5" />
                  Отправить сообщение
                </button>
              </form>
            )}
          </Card>

          {/* Contact Info */}
          <div className="space-y-6 flex flex-col h-full">
            <Card className="scroll-fade-right flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Mail className="h-6 w-6 text-accent-cyan" />
                Контакты
              </h3>
              <div className="space-y-6 text-gray-300 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <p className="font-semibold text-white mb-2 text-base">Email поддержки</p>
                    <a href="mailto:support@itgrads.com" className="text-accent-cyan hover:text-accent-blue text-base">
                      support@itgrads.com
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2 text-base">Телефон</p>
                    <a href="tel:+79991234567" className="text-accent-cyan hover:text-accent-blue text-base">
                      +7 (999) 123-45-67
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2 text-base">Время работы</p>
                    <p className="text-base">Понедельник - Пятница: 9:00 - 18:00 МСК</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="scroll-fade-right flex-1 flex flex-col" style={{ transitionDelay: '0.1s' }}>
              <h3 className="text-2xl font-bold text-white mb-6">Полезные ссылки</h3>
              <ul className="space-y-4 text-gray-300 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <li>
                    <a href="/faq" className="text-accent-cyan hover:text-accent-blue text-base block">
                      → Часто задаваемые вопросы
                    </a>
                  </li>
                  <li>
                    <a href="/registration" className="text-accent-cyan hover:text-accent-blue text-base block">
                      → Регистрация на платформе
                    </a>
                  </li>
                  <li>
                    <a href="/skills" className="text-accent-cyan hover:text-accent-blue text-base block">
                      → Как использовать карту навыков
                    </a>
                  </li>
                </div>
              </ul>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default Help

