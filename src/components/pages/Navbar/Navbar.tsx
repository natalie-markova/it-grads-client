import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, UserCircle, LogOut, MessageSquare } from 'lucide-react'
import { $api } from "../../../utils/axios.instance";
import { chatAPI } from '../../../utils/chat.api';
import { socketService } from '../../../utils/socket.service';
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
    const [unreadCount, setUnreadCount] = useState(0);

    // Функция для загрузки непрочитанных сообщений
    const loadUnreadCount = () => {
        if (user) {
            chatAPI.getUnreadCount()
                .then(data => setUnreadCount(data.unreadCount))
                .catch(err => console.error('Error loading unread count:', err));
        }
    };

    // Загрузка количества непрочитанных сообщений
    useEffect(() => {
        loadUnreadCount();
    }, [user]);

    // Периодическое обновление счетчика непрочитанных сообщений
    useEffect(() => {
        if (!user) return;

        // Обновляем каждые 30 секунд
        const interval = setInterval(() => {
            loadUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    // WebSocket подключение для обновления в реальном времени
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('accessToken') || '';
        if (token && !socketService.isConnected()) {
            socketService.connect(token);
        }

        // Подписываемся на уведомления о непрочитанных сообщениях
        socketService.onNotificationUnread(() => {
            console.log('📬 Получено уведомление о новом сообщении');
            loadUnreadCount();
        });

        // Подписываемся на событие прочтения сообщений
        socketService.onMessagesRead(() => {
            console.log('✅ Сообщения прочитаны, обновляем счетчик');
            loadUnreadCount();
        });

        return () => {
            socketService.off('notification-unread');
            socketService.off('messages-read');
        };
    }, [user]);

    const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

    const baseNavLinks = [
        { path: '/skills', label: 'Радар навыков' },
        { path: '/interview', label: 'Собеседования' },
        { path: '/jobs', label: 'Вакансии' },
    ]

    const graduateNavLinks = [
        ...baseNavLinks,
        { path: '/roadmap', label: 'Карта специальностей' },
    ]

    const employerNavLinks = [
        { path: '/candidates', label: 'Кандидаты' },
        { path: '/jobs', label: 'Вакансии' },
    ]

    const navLinks = userType === 'graduate' ? graduateNavLinks : (userType === 'employer' ? employerNavLinks : baseNavLinks)

    function logoutHandler() {
        $api("/users/logout")
        .then((response) => {
            if (response.status === 200) {
                setUser(null)
                localStorage.removeItem('user')
                localStorage.removeItem('accessToken')
                navigate("/home");
            }
        })
        .catch((err) => {
            console.error(err);
            // Даже при ошибке очищаем данные
            setUser(null)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
        });
    }

    return (
        <nav className="bg-dark-surface shadow-lg border-b border-dark-card sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="bg-accent-cyan px-2 py-1 rounded-lg">
                            <span className="text-xl font-mono font-bold text-dark-bg">&lt;/&gt;</span>
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
                                    to="/messenger"
                                    className="relative text-gray-300 hover:text-accent-cyan px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
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
                                        to="/messenger"
                                        onClick={() => setIsOpen(false)}
                                        className="relative flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        <span>Сообщения</span>
                                        {unreadCount > 0 && (
                                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>
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
