import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { User } from '../types'

interface FooterProps {
  user: User | null
}

const Footer = ({ user }: FooterProps) => {
  const userType = user?.role || null
  const { t } = useTranslation()
  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    toast.success(t('toasts.phoneAppOpening'))
    // Открываем звонок после небольшой задержки, чтобы показать toast
    setTimeout(() => {
      window.location.href = 'tel:+79991234567'
    }, 500)
  }

  return (
    <footer className="bg-dark-surface text-gray-300 border-t border-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">IT-Grads</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2 text-sm">
              {userType === 'employer' ? (
                <>
                  <li>
                    <Link to="/home" className="hover:text-accent-cyan transition-colors text-gray-400">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/interview" className="hover:text-accent-cyan transition-colors text-gray-400">
                      {t('navbar.interviews')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/candidates" className="hover:text-accent-cyan transition-colors text-gray-400">
                      {t('auth.graduate')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/home" className="hover:text-accent-cyan transition-colors text-gray-400">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/skills" className="hover:text-accent-cyan transition-colors text-gray-400">
                      {t('navbar.skillsRadar')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/interview" className="hover:text-accent-cyan transition-colors text-gray-400">
                      {t('navbar.interviews')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/jobs" className="hover:text-accent-cyan transition-colors text-gray-400">
                      {t('navbar.vacancies')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{t('footer.terms')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-accent-cyan transition-colors text-gray-400">
                  Help
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-accent-cyan transition-colors text-gray-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">{t('footer.contacts')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4 text-accent-cyan" />
                <a href="mailto:info@itgrads.com" className="hover:text-accent-cyan transition-colors">
                  info@itgrads.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4 text-accent-cyan" />
                <a 
                  href="tel:+79991234567" 
                  onClick={handlePhoneClick}
                  className="hover:text-accent-cyan transition-colors"
                >
                  +7 (999) 123-45-67
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-card mt-8 pt-8 text-center text-sm text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer








