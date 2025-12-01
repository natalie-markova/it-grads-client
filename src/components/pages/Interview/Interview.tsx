import React, { useState } from 'react'
import { Play, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'

interface Question {
  id: number
  category: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    category: 'JavaScript',
    question: 'Что такое замыкание (closure) в JavaScript?',
    options: [
      'Функция, которая имеет доступ к переменным внешней области видимости',
      'Способ изоляции переменных',
      'Метод оптимизации кода',
      'Тип данных в JavaScript',
    ],
    correctAnswer: 0,
    explanation: 'Замыкание - это функция, которая имеет доступ к переменным внешней (охватывающей) области видимости, даже после того, как внешняя функция завершила выполнение.',
  },
  {
    id: 2,
    category: 'React',
    question: 'В чем разница между useState и useReducer?',
    options: [
      'useState для простого состояния, useReducer для сложной логики',
      'useState быстрее, чем useReducer',
      'useReducer только для массивов',
      'Нет разницы',
    ],
    correctAnswer: 0,
    explanation: 'useState подходит для простого локального состояния, а useReducer лучше использовать когда логика обновления состояния сложная или когда следующее состояние зависит от предыдущего.',
  },
  {
    id: 3,
    category: 'Алгоритмы',
    question: 'Какая временная сложность у бинарного поиска?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 1,
    explanation: 'Бинарный поиск имеет временную сложность O(log n), так как на каждой итерации мы уменьшаем область поиска вдвое.',
  },
  {
    id: 4,
    category: 'Базы данных',
    question: 'Что такое нормализация базы данных?',
    options: [
      'Процесс организации данных для уменьшения избыточности',
      'Увеличение производительности запросов',
      'Создание резервных копий',
      'Шифрование данных',
    ],
    correctAnswer: 0,
    explanation: 'Нормализация - это процесс организации данных в базе данных для уменьшения избыточности и улучшения целостности данных.',
  },
  {
    id: 5,
    category: 'Системный дизайн',
    question: 'Что такое горизонтальное масштабирование?',
    options: [
      'Добавление большего количества серверов',
      'Увеличение мощности существующих серверов',
      'Оптимизация кода',
      'Сжатие данных',
    ],
    correctAnswer: 0,
    explanation: 'Горизонтальное масштабирование (scaling out) - это добавление большего количества серверов для обработки нагрузки, в отличие от вертикального масштабирования (scaling up), которое увеличивает мощность существующих серверов.',
  },
  {
    id: 6,
    category: 'JavaScript',
    question: 'Что выведет console.log(typeof null)?',
    options: ['null', 'undefined', 'object', 'boolean'],
    correctAnswer: 2,
    explanation: 'Это известная особенность JavaScript - typeof null возвращает "object", хотя null является примитивным значением. Это баг, который сохраняется для обратной совместимости.',
  },
  {
    id: 7,
    category: 'React',
    question: 'Что такое виртуальный DOM?',
    options: [
      'Легковесная копия реального DOM в памяти',
      'Способ рендеринга на сервере',
      'Тип компонента React',
      'Метод оптимизации CSS',
    ],
    correctAnswer: 0,
    explanation: 'Виртуальный DOM - это легковесная копия реального DOM, хранящаяся в памяти. React использует его для эффективного обновления только измененных частей реального DOM.',
  },
  {
    id: 8,
    category: 'Алгоритмы',
    question: 'Какая структура данных используется для реализации очереди (queue)?',
    options: ['Стек', 'Массив', 'Связанный список', 'Дерево'],
    correctAnswer: 2,
    explanation: 'Очередь обычно реализуется с помощью связанного списка, так как добавление и удаление элементов происходит за O(1) на обоих концах.',
  },
  {
    id: 9,
    category: 'Базы данных',
    question: 'Что такое ACID в контексте транзакций?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Метод индексации',
      'Тип базы данных',
      'Язык запросов',
    ],
    correctAnswer: 0,
    explanation: 'ACID - это набор свойств транзакций: Atomicity (атомарность), Consistency (согласованность), Isolation (изоляция), Durability (долговечность).',
  },
  {
    id: 10,
    category: 'Системный дизайн',
    question: 'Что такое кэширование?',
    options: [
      'Хранение часто используемых данных в быстродоступном месте',
      'Удаление старых данных',
      'Шифрование информации',
      'Сжатие файлов',
    ],
    correctAnswer: 0,
    explanation: 'Кэширование - это техника хранения копии данных в быстродоступном месте для ускорения последующих запросов к этим данным.',
  },
]

const Interview = () => {
  useScrollAnimation()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [category, setCategory] = useState<string>('all')

  const filteredQuestions = category === 'all' 
    ? questions 
    : questions.filter(q => q.category === category)

  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const categories = ['all', ...Array.from(new Set(questions.map(q => q.category)))]

  const handleStart = () => {
    setIsStarted(true)
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnsweredQuestions(new Set())
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return
    
    setSelectedAnswer(answerIndex)
    setShowExplanation(true)
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
    
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]))
  }

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handleReset = () => {
    setIsStarted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setAnsweredQuestions(new Set())
  }

  if (!isStarted) {
    return (
      <div className="bg-dark-bg min-h-screen py-8">
        <Section 
          title="Симулятор собеседования"
          subtitle="Практикуйтесь с реальными вопросами технических интервью"
          className="bg-dark-bg py-0 scroll-animate-item"
        >
          <Card className="max-w-2xl mx-auto scroll-animate-item">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 scroll-animate-item">Выберите категорию вопросов</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {categories.map((cat, index) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all scroll-animate-item ${
                      category === cat
                        ? 'bg-accent-cyan text-dark-bg'
                        : 'bg-dark-surface text-white hover:bg-dark-card'
                    }`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    {cat === 'all' ? 'Все категории' : cat}
                  </button>
                ))}
              </div>
              <p className="text-gray-300 mb-6 scroll-animate-item" style={{ transitionDelay: '0.3s' }}>
                Выбрано вопросов: {filteredQuestions.length}
              </p>
              <button onClick={handleStart} className="btn-primary inline-flex items-center gap-2 scroll-animate-item" style={{ transitionDelay: '0.4s' }}>
                <Play className="h-5 w-5" />
                Начать симуляцию
              </button>
            </div>
          </Card>
        </Section>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title="Симулятор собеседования"
        subtitle={`Вопрос ${currentQuestionIndex + 1} из ${filteredQuestions.length}`}
        className="bg-dark-bg py-0"
      >
        <Card className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                Прогресс: {currentQuestionIndex + 1} / {filteredQuestions.length}
              </span>
              <span className="text-sm text-gray-300">
                Правильных ответов: {score} / {answeredQuestions.size}
              </span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2">
              <div
                className="bg-accent-cyan h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-lg text-sm font-medium">
                {currentQuestion.category}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-6">
              {currentQuestion.question}
            </h3>

            {/* Answers */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = showExplanation

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showResult
                        ? isCorrect
                          ? 'bg-green-500/20 border-green-500 text-white'
                          : isSelected
                          ? 'bg-red-500/20 border-red-500 text-white'
                          : 'bg-dark-surface border-dark-card text-gray-300'
                        : 'bg-dark-surface border-dark-card text-gray-300 hover:border-accent-cyan hover:bg-dark-card'
                    } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-accent-cyan/30">
                <h4 className="text-lg font-semibold text-white mb-2">Объяснение:</h4>
                <p className="text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-dark-surface">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Начать заново
            </button>
            {currentQuestionIndex < filteredQuestions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!showExplanation}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Следующий вопрос
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="text-center">
                <p className="text-white font-semibold mb-2">
                  Симуляция завершена!
                </p>
                <p className="text-gray-300 text-sm">
                  Правильных ответов: {score} из {filteredQuestions.length} ({Math.round((score / filteredQuestions.length) * 100)}%)
                </p>
              </div>
            )}
          </div>
        </Card>
      </Section>
    </div>
  )
}

export default Interview
