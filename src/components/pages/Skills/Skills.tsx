import { useOutletContext, useNavigate } from 'react-router-dom'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import SkillsRadar from '../../../components/SkillsRadar'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'

const Skills = () => {
  const { user } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  useScrollAnimation()

  return (
    <div className="bg-dark-bg min-h-screen">
      <Section
        title="Навыки и Проекты"
        subtitle="Визуализируйте свои умения и демонстрируйте портфолио"
        className="bg-dark-bg scroll-animate-item"
      >
        {user ? (
          <SkillsRadar user={user} redirectToJobs={true} />
        ) : (
          <Card>
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-white mb-4">Требуется авторизация</h3>
              <p className="text-gray-300 mb-6">
                Для использования интерактивной карты навыков необходимо войти в систему
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Войти
              </button>
            </div>
          </Card>
        )}
      </Section>
    </div>
  )
}

export default Skills

