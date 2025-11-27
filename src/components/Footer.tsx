import { Link } from 'react-router-dom'
import { Linkedin, Github, Mail, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark-surface text-gray-300 border-t border-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">IT-Grads</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Платформа для выпускников IT-школ и молодых специалистов. 
              Найдите работу мечты и пройдите собеседования с уверенностью.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/home" className="hover:text-accent-cyan transition-colors text-gray-400">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-accent-cyan transition-colors text-gray-400">
                  Навыки и Проекты
                </Link>
              </li>
              <li>
                <Link to="/interview/setup" className="hover:text-accent-cyan transition-colors text-gray-400">
                  Собеседования
                </Link>
              </li>
              <li>
                <Link to="/ai" className="hover:text-accent-cyan transition-colors text-gray-400">
                  ИИ и Автоматизация
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Ресурсы</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-accent-cyan transition-colors text-gray-400">
                  Помощь
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
            <h3 className="text-white text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4 text-accent-cyan" />
                <span>info@itgrads.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4 text-accent-cyan" />
                <span>+7 (999) 123-45-67</span>
              </li>
              <li className="flex items-center space-x-4 pt-2">
                <a href="#" className="hover:text-accent-cyan transition-colors text-gray-400">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-accent-cyan transition-colors text-gray-400">
                  <Github className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-card mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 IT-Grads. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer








