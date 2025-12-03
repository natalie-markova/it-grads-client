import { useOutletContext, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import SkillsRadarCompact from '../../SkillsRadarCompact'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'

const Skills = () => {
  const { user } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  useScrollAnimation()

  return (
    <div className="bg-dark-bg min-h-screen">
      <Section
        title={t('skills.title')}
        subtitle={t('skills.subtitle')}
        className="bg-dark-bg scroll-animate-item"
      >
        {user ? (
          <SkillsRadarCompact user={user} />
        ) : (
          <Card>
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-white mb-4">{t('skills.authRequired')}</h3>
              <p className="text-gray-300 mb-6">
                {t('skills.authRequiredDesc')}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                {t('auth.loginButton')}
              </button>
            </div>
          </Card>
        )}
      </Section>
    </div>
  )
}

export default Skills

