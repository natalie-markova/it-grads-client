import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Users, LogIn, UserCircle, LogOut } from 'lucide-react'
import { $api } from "../../../utils/axios.instance";
import { User } from "../../../types";

interface NavbarProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

const Navbar = ({ user, setUser }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const userType = user?.role || null

    const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

    const baseNavLinks = [
        { path: '/home', label: 'Главная' },
        { path: '/skills', label: 'Навыки и Проекты' },
        { path: '/interview', label: 'Собеседования' },
        { path: '/ai', label: 'ИИ и Автоматизация' },
        { path: '/jobs', label: 'Вакансии' },
    ]

    const graduateNavLinks = [
        ...baseNavLinks,
        { path: '/roadmap', label: 'Карта специальностей' },
    ]

    const navLinks = userType === 'graduate' ? graduateNavLinks : baseNavLinks

    function logoutHandler() {
        $api("/users/logout")
        .then((response) => {
            if (response.status === 200) {
                setUser(null)
                navigate("/home");
            }
        })
        .catch((err) => console.error(err));
    }

    return (
        <nav className="bg-dark-surface shadow-lg border-b border-dark-card sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="bg-accent-cyan p-2 rounded-lg">
                            <Users className="h-6 w-6 text-dark-bg" />
                        </div>
                        <span className="text-xl font-bold text-white">IT-Grads</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.path)
                                        ? 'text-accent-cyan bg-dark-card'
                                        : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user && userType ? (
                            <>
                                <Link
                                    to={userType === 'graduate' ? "/profile/graduate" : "/profile/employer"}
                                    className="text-gray-300 hover:text-accent-cyan px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <UserCircle className="h-4 w-4" />
                                    <span>Профиль</span>
                                </Link>
                                <button
                                    onClick={logoutHandler}
                                    className="text-gray-300 hover:text-accent-cyan px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Выйти</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-accent-cyan px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Войти</span>
                                </Link>
                                <Link
                                    to="/registration"
                                    className="btn-primary text-sm"
                                >
                                    Регистрация
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-accent-cyan focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden border-t border-dark-card">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    isActive(link.path)
                                        ? 'text-accent-cyan bg-dark-card'
                                        : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 space-y-2">
                            {user && userType ? (
                                <>
                                    <Link
                                        to={userType === 'graduate' ? "/profile/graduate" : "/profile/employer"}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        Профиль
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logoutHandler()
                                            setIsOpen(false)
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        Войти
                                    </Link>
                                    <Link
                                        to="/registration"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium bg-accent-cyan text-dark-bg text-center"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
