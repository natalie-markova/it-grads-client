import { User, Radar, FileText, Heart, Send } from 'lucide-react'

interface GraduateProfileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const GraduateProfileNav = ({ activeTab, onTabChange }: GraduateProfileNavProps) => {
  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'radar', label: 'Радар навыков', icon: Radar },
    { id: 'resumes', label: 'Мои резюме', icon: FileText },
    { id: 'favorites', label: 'Избранные вакансии', icon: Heart },
    { id: 'applications', label: 'Мои отклики', icon: Send },
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
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default GraduateProfileNav

