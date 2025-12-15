import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, CheckCircle, XCircle, RotateCcw, ArrowRight, Trophy, Target, TrendingUp, Home } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { $api } from '../../../utils/axios.instance'
import { useParmaEvents } from '../../mascot'
import { useTranslation } from 'react-i18next'
import { questions as allQuestions, getLocalizedQuestion, getLocalizedCategoryName } from './quizQuestions'

interface LocalizedQuestion {
  id: number
  category: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const Interview = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  useScrollAnimation()
  const { onTrainerSuccess, onTrainerFail } = useParmaEvents()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [category, setCategory] = useState<string>('')
  const [userAnswers, setUserAnswers] = useState<{questionId: number, correct: boolean}[]>([])
  const [shuffledQuestions, setShuffledQuestions] = useState<LocalizedQuestion[]>([])
  const [, setIsSaving] = useState(false)
  const startTimeRef = useRef<number>(0)

  const currentLang = i18n.language

  const categories = useMemo(() => {
    return Array.from(new Set(allQuestions.map(q => q.category)))
  }, [])

  const currentQuestion = shuffledQuestions[currentQuestionIndex]

  const getCategoryName = (cat: string): string => {
    return getLocalizedCategoryName(cat, currentLang)
  }

  const handleStart = () => {
    if (!category) return
    const categoryQuestions = allQuestions.filter(q => q.category === category)
    const localizedQuestions = categoryQuestions.map(q => getLocalizedQuestion(q, currentLang))

    const questionsWithShuffledOptions = localizedQuestions.map(q => {
      const optionsWithIndices = q.options.map((option, idx) => ({ option, originalIndex: idx }))
      const shuffledOptions = shuffleArray(optionsWithIndices)

      const newCorrectAnswerIndex = shuffledOptions.findIndex(o => o.originalIndex === q.correctAnswer)

      return {
        ...q,
        options: shuffledOptions.map(o => o.option),
        correctAnswer: newCorrectAnswerIndex
      }
    })

    setShuffledQuestions(shuffleArray(questionsWithShuffledOptions))
    setIsStarted(true)
    setIsFinished(false)
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnsweredQuestions(new Set())
    setSelectedAnswer(null)
    setShowExplanation(false)
    setUserAnswers([])
    startTimeRef.current = Date.now()
  }

  const savePracticeResults = async (finalScore: number, answers: {questionId: number, correct: boolean}[]) => {
    try {
      setIsSaving(true)
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      const percentage = Math.round((finalScore / shuffledQuestions.length) * 100)

      await $api.post('/interviews/practice/complete', {
        category,
        totalQuestions: shuffledQuestions.length,
        correctAnswers: finalScore,
        percentage,
        answers: answers.map(a => ({
          questionId: a.questionId,
          isCorrect: a.correct
        })),
        duration
      })
    } catch (error) {
      console.error('Failed to save practice results:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return

    setSelectedAnswer(answerIndex)
    setShowExplanation(true)

    const isCorrect = answerIndex === currentQuestion.correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }

    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]))
    setUserAnswers([...userAnswers, { questionId: currentQuestion.id, correct: isCorrect }])
  }

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      const finalAnswers = [...userAnswers]
      const finalScore = finalAnswers.filter(a => a.correct).length
      const percentage = Math.round((finalScore / shuffledQuestions.length) * 100)

      if (percentage >= 70) {
        onTrainerSuccess(percentage, 'practice')
      } else {
        onTrainerFail(percentage)
      }

      savePracticeResults(finalScore, finalAnswers)
      setIsFinished(true)
    }
  }

  useEffect(() => {
    if (isFinished) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [isFinished])

  const handleReset = () => {
    setIsStarted(false)
    setIsFinished(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setAnsweredQuestions(new Set())
    setCategory('')
    setUserAnswers([])
  }

  const getResultComment = (percentage: number) => {
    if (percentage >= 90) {
      return {
        title: t('practiceQuizResults.excellent'),
        message: t('practiceQuizResults.excellentMessage'),
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30'
      }
    } else if (percentage >= 70) {
      return {
        title: t('practiceQuizResults.good'),
        message: t('practiceQuizResults.goodMessage'),
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30'
      }
    } else if (percentage >= 50) {
      return {
        title: t('practiceQuizResults.average'),
        message: t('practiceQuizResults.averageMessage'),
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30'
      }
    } else {
      return {
        title: t('practiceQuizResults.needsWork'),
        message: t('practiceQuizResults.needsWorkMessage'),
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30'
      }
    }
  }

  if (isFinished) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100)
    const result = getResultComment(percentage)

    return (
      <div className="bg-dark-bg min-h-screen py-8">
        <Section
          title={t('practiceQuizResults.title')}
          subtitle={`${t('practiceQuizResults.category')}: ${getCategoryName(category)}`}
          className="bg-dark-bg py-0"
        >
          <Card className="max-w-3xl mx-auto" hover={false}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-accent-cyan" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {score} {t('practiceQuizResults.of')} {shuffledQuestions.length}
              </h2>
              <p className="text-5xl font-bold text-accent-cyan mb-4">
                {percentage}%
              </p>
            </div>

            <div className={`p-6 rounded-xl ${result.bgColor} border ${result.borderColor} mb-8`}>
              <h3 className={`text-xl font-bold ${result.color} mb-2 flex items-center gap-2`}>
                <Target className="w-5 h-5" />
                {result.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-dark-surface rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">{score}</span>
                </div>
                <p className="text-gray-400 text-sm">{t('practiceQuizResults.correctAnswers')}</p>
              </div>
              <div className="bg-dark-surface rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-500">{shuffledQuestions.length - score}</span>
                </div>
                <p className="text-gray-400 text-sm">{t('practiceQuizResults.incorrectAnswers')}</p>
              </div>
            </div>

            <div className="bg-dark-surface rounded-xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-cyan" />
                {t('practiceQuizResults.recommendations')}
              </h4>
              <ul className="space-y-2 text-gray-300">
                {percentage < 70 && (
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan">•</span>
                    <span>{t('practiceQuizResults.reviewBasics', { category: getCategoryName(category) })}</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t('practiceQuizResults.practiceRealTasks')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t('practiceQuizResults.tryAgainLater')}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {t('practiceQuizResults.chooseAnotherCategory')}
              </button>
              <button
                onClick={() => {
                  setIsFinished(false)
                  setIsStarted(false)
                  setCurrentQuestionIndex(0)
                  setScore(0)
                  setAnsweredQuestions(new Set())
                  setSelectedAnswer(null)
                  setShowExplanation(false)
                  setUserAnswers([])
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                {t('practiceQuizResults.retakeTest')}
              </button>
              <button
                onClick={() => navigate('/home')}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                {t('practiceQuizResults.toHome')}
              </button>
            </div>
          </Card>
        </Section>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="bg-dark-bg min-h-screen py-8">
        <Section
          title={t('practiceQuizUI.title')}
          subtitle={t('practiceQuizUI.subtitle')}
          className="bg-dark-bg py-0"
        >
          <Card className="max-w-3xl mx-auto" hover={false}>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">{t('practiceQuizUI.selectCategory')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {categories.map((cat) => {
                  const catQuestions = allQuestions.filter(q => q.category === cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-4 rounded-lg font-medium transition-all ${
                        category === cat
                          ? 'bg-accent-cyan text-dark-bg ring-2 ring-accent-cyan ring-offset-2 ring-offset-dark-bg'
                          : 'bg-dark-surface text-white hover:bg-dark-card'
                      }`}
                    >
                      <div className="text-lg">{getCategoryName(cat)}</div>
                      <div className={`text-sm mt-1 ${category === cat ? 'text-dark-bg/70' : 'text-gray-400'}`}>
                        {catQuestions.length} {t('practiceQuizUI.questions')}
                      </div>
                    </button>
                  )
                })}
              </div>
              {category && (
                <p className="text-gray-300 mb-6">
                  {t('practiceQuizUI.selectedCategory')}: <span className="text-accent-cyan font-semibold">{getCategoryName(category)}</span> (10 {t('practiceQuizUI.questions')})
                </p>
              )}
              <button
                onClick={handleStart}
                disabled={!category}
                className={`btn-primary inline-flex items-center gap-2 ${!category ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Play className="h-5 w-5" />
                {t('practiceQuizUI.startTest')}
              </button>
            </div>
          </Card>
        </Section>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title={t('practiceQuizUI.title')}
        subtitle={`${getCategoryName(category)} • ${t('practiceQuizUI.questionOf', { current: currentQuestionIndex + 1, total: shuffledQuestions.length })}`}
        className="bg-dark-bg py-0"
      >
        <Card className="max-w-3xl mx-auto" hover={false}>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                {t('practiceQuizUI.progress')}: {currentQuestionIndex + 1} / {shuffledQuestions.length}
              </span>
              <span className="text-sm text-gray-300">
                {t('practiceQuizUI.correct')}: {score} / {answeredQuestions.size}
              </span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2">
              <div
                className="bg-accent-cyan h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {currentQuestion?.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => {
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

            {showExplanation && currentQuestion && (
              <div className="mt-6 p-4 bg-dark-surface rounded-lg border border-accent-cyan/30">
                <h4 className="text-lg font-semibold text-white mb-2">{t('practiceQuizUI.explanation')}:</h4>
                <p className="text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-dark-surface">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('practiceQuizUI.exit')}
            </button>
            <button
              onClick={handleNext}
              disabled={!showExplanation}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                <>
                  {t('practiceQuizUI.nextQuestion')}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t('practiceQuizUI.finishTest')}
                  <Trophy className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </Card>
      </Section>
    </div>
  )
}

export default Interview