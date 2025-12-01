import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

const FAQ = () => {
  useScrollAnimation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'Как зарегистрироваться на платформе?',
      answer: 'Нажмите кнопку "Регистрация" в правом верхнем углу, выберите тип аккаунта (выпускник или работодатель), заполните форму и подтвердите email.',
    },
    {
      question: 'Как создать профиль?',
      answer: 'После регистрации перейдите в раздел "Профиль" в навигационном меню. Заполните все необходимые поля: фото, личные данные, образование, опыт работы и сохраните профиль.',
    },
    {
      question: 'Как использовать интерактивную карту навыков?',
      answer: 'Перейдите в раздел "Радар навыков", нажмите "Редактировать" и используйте слайдеры для оценки вашего уровня владения каждым навыком от 0 до 5. Карта автоматически обновится.',
    },
    {
      question: 'Как откликнуться на вакансию?',
      answer: 'Найдите интересующую вакансию в разделе "Вакансии", нажмите "Подробнее" для просмотра полной информации, затем нажмите "Откликнуться". Ваш отклик будет отправлен работодателю.',
    },
    {
      question: 'Как работает симулятор собеседования?',
      answer: 'В разделе "Собеседования" выберите категорию вопросов (технические, поведенческие и т.д.), начните симуляцию и отвечайте на вопросы. Вы получите мгновенную обратную связь и рекомендации.',
    },
    {
      question: 'Можно ли изменить профиль после создания?',
      answer: 'Да, вы можете редактировать свой профиль в любое время. Перейдите в раздел "Профиль", нажмите кнопку редактирования, внесите изменения и сохраните.',
    },
    {
      question: 'Как связаться с работодателем?',
      answer: 'После того как вы откликнетесь на вакансию, работодатель может начать с вами чат. Все ваши чаты доступны в разделе "Профиль" в секции "Чаты".',
    },
    {
      question: 'Как добавить GitHub проект для анализа?',
      answer: 'В разделе "Радар навыков" найдите секцию "Автоматический анализ проектов", введите ссылку на ваш GitHub репозиторий и нажмите "Анализировать". Система автоматически определит используемые технологии.',
    },
    {
      question: 'Что делать, если забыл пароль?',
      answer: 'На странице входа нажмите "Забыли пароль?", введите ваш email и следуйте инструкциям в письме для восстановления доступа.',
    },
    {
      question: 'Как оставить отзыв о работодателе?',
      answer: 'После прохождения собеседования или работы с компанией вы можете оставить отзыв в разделе "Рейтинги и отзывы". Работодатель сможет ответить на ваш отзыв.',
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section title="Часто задаваемые вопросы" subtitle="Найдите ответы на популярные вопросы о платформе IT-Grads" className="bg-dark-bg py-0 scroll-animate-item">
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-accent-cyan flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-accent-cyan flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <p className="text-gray-300 mt-4 leading-relaxed">{faq.answer}</p>
              )}
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

export default FAQ

