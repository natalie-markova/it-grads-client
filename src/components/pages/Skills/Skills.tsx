import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Github, ExternalLink } from 'lucide-react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import SkillsRadar from '../../../components/SkillsRadar'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'

const Skills = () => {
  const { user } = useOutletContext<OutletContext>()
  useScrollAnimation()
  const [githubUrl, setGithubUrl] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAnalyze = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    // Here would be the GitHub API integration
    toast.success(`Анализ репозитория ${githubUrl} начат!`)
  }

  return (
    <div className="bg-dark-bg min-h-screen">
      <Section 
        title="Навыки и Проекты"
        subtitle="Визуализируйте свои умения и демонстрируйте портфолио"
        className="bg-dark-bg scroll-animate-item"
      >
        {user ? (
          <SkillsRadar user={user} />
        ) : (
          <Card>
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-white mb-4">Требуется авторизация</h3>
              <p className="text-gray-300 mb-6">
                Для использования интерактивной карты навыков необходимо войти в систему
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary"
              >
                Войти
              </button>
            </div>
          </Card>
        )}

        <div className="mt-8">
          <Card className="scroll-animate-item">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Github className="h-6 w-6 text-accent-cyan" />
              Автоматический анализ проектов
            </h3>
            <p className="text-gray-300 mb-6">
              Интеграция с GitHub API для автоматического анализа ваших проектов. 
              Определяем используемые технологии, архитектурные решения и качество кода.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAnalyze}
                  className="btn-primary flex items-center gap-2"
                  disabled={!githubUrl}
                >
                  <ExternalLink className="h-5 w-5" />
                  Анализировать
                </button>
              </div>
              {githubUrl && (
                <div className="bg-dark-surface rounded-lg p-4 border border-dark-card">
                  <div className="flex items-center space-x-3 mb-4">
                    <Github className="h-6 w-6 text-accent-cyan" />
                    <div className="flex-1">
                      <div className="h-3 bg-dark-card rounded w-48 mb-2"></div>
                      <div className="h-2 bg-dark-card rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-dark-card rounded"></div>
                    <div className="h-2 bg-dark-card rounded w-5/6"></div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Требуется авторизация</h3>
                <p className="text-gray-300 mb-6">
                  Для использования интерактивной карты навыков необходимо войти в систему или зарегистрироваться
                </p>
                <div className="flex gap-4 justify-center">
                  <a href="/login" className="btn-primary">
                    Войти
                  </a>
                  <a href="/registration" className="btn-secondary">
                    Регистрация
                  </a>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Section>
    </div>
  )
}

export default Skills

