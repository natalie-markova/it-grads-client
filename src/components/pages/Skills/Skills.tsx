import { useOutletContext, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import Section from '../../ui/Section'
import Card from '../../ui/Card'
import AutoSkillsRadar from '../../AutoSkillsRadar'
import SkillsRadarCompact from '../../SkillsRadarCompact'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'

const Skills = () => {
  const { user } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showManualRadar, setShowManualRadar] = useState(false)
  useScrollAnimation()

  return (
    <div className="bg-dark-bg min-h-screen">
      <Section
        title={t('skills.title')}
        subtitle={t('skills.autoSubtitle')}
        className="bg-dark-bg scroll-animate-item"
      >
        {user ? (
          <div className="space-y-6">
            {/* Tab switcher */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowManualRadar(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  !showManualRadar
                    ? 'bg-accent-cyan text-white'
                    : 'bg-dark-surface text-gray-400 hover:text-white'
                }`}
              >
                {t('skills.autoRadar')}
              </button>
              <button
                onClick={() => setShowManualRadar(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  showManualRadar
                    ? 'bg-accent-cyan text-white'
                    : 'bg-dark-surface text-gray-400 hover:text-white'
                }`}
              >
                {t('skills.manualMode')}
              </button>
            </div>

            {/* Info banner for auto radar */}
            {!showManualRadar && (
              <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/30 rounded-lg p-4">
                <p className="text-gray-300 text-sm">
                  <span className="text-accent-cyan font-medium">{t('skills.howItWorks')}</span> {t('skills.howItWorksDesc')}
                </p>
                <ul className="text-gray-400 text-sm mt-2 space-y-1 ml-4 list-disc">
                  <li><strong className="text-white">{t('skills.codeBattle')}</strong> - {t('skills.codeBattleDesc')}</li>
                  <li><strong className="text-white">{t('resume.title')}</strong> - {t('skills.resumeDesc')}</li>
                  <li><strong className="text-white">{t('interview.aiInterview.title')}</strong> - {t('skills.aiInterviewDesc')}</li>
                  <li><strong className="text-white">{t('interview.audioInterview.title')}</strong> - {t('skills.audioInterviewDesc')}</li>
                  <li><strong className="text-white">{t('roadmap.title')}</strong> - {t('skills.roadmapsDesc')}</li>
                </ul>
              </div>
            )}

            {/* Radar */}
            {showManualRadar ? (
              <SkillsRadarCompact user={user} />
            ) : (
              <AutoSkillsRadar userId={user.id} />
            )}
          </div>
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

