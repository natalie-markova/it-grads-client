import { User, Radar, FileText, Heart, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface GraduateProfileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const GraduateProfileNav = ({ activeTab, onTabChange }: GraduateProfileNavProps) => {
  const { t } = useTranslation()

  const tabs = [
    { id: 'profile', labelKey: 'profile.title', icon: User },
    { id: 'radar', labelKey: 'profile.skillsRadar', icon: Radar },
    { id: 'resumes', labelKey: 'profile.myResumes', icon: FileText },
    { id: 'favorites', labelKey: 'profile.favorites', icon: Heart },
    { id: 'applications', labelKey: 'profile.myResponses', icon: Send },
  ]

  return (
    <div className="mb-6">
      <nav className="flex gap-2 bg-dark-card rounded-xl p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-accent-cyan text-dark-bg shadow-lg'
                  : 'text-gray-300 hover:bg-dark-surface hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default GraduateProfileNav
