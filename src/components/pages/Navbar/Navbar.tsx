import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, UserCircle, LogOut, MessageSquare, Globe, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { $api } from "../../../utils/axios.instance";
import { chatAPI } from '../../../utils/chat.api';
import { socketService } from '../../../utils/socket.service';
import { User } from "../../../types";

interface NavbarProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

const languages = [
    { code: 'ru', name: 'Русский', short: 'RU' },
    { code: 'en', name: 'English', short: 'EN' },
];

const Navbar = ({ user, setUser }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLangOpen, setIsLangOpen] = useState(false)
    const [isDarkZonesOpen, setIsDarkZonesOpen] = useState(false)
    const [isMobileDarkZonesOpen, setIsMobileDarkZonesOpen] = useState(false)
    const langDropdownRef = useRef<HTMLDivElement>(null)
    const darkZonesDropdownRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const userType = user?.role || null
    const [unreadCount, setUnreadCount] = useState(0);

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsLangOpen(false);
    };

    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
            if (darkZonesDropdownRef.current && !darkZonesDropdownRef.current.contains(event.target as Node)) {
                setIsDarkZonesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUnreadCount = useCallback(() => {
        if (user) {
            chatAPI.getUnreadCount()
                .then(data => {
                    console.log('📊 Unread count loaded:', data.unreadCount);
                    setUnreadCount(data.unreadCount);
                })
                .catch(err => console.error('Error loading unread count:', err));
        } else {
            setUnreadCount(0);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            socketService.disconnect();
            return;
        }

        loadUnreadCount();

        const token = localStorage.getItem('accessToken');
        if (token && !socketService.isConnected()) {
            console.log('🔌 Connecting to WebSocket from Navbar');
            socketService.connect(token);
        }

        const handleNotificationUnread = (data: any) => {
            console.log('📬 Navbar: Получено уведомление о новом сообщении', data);
            loadUnreadCount();
        };

        const handleMessagesRead = (data: any) => {
            console.log('✅ Navbar: Сообщения прочитаны', data);
            loadUnreadCount();
        };

        socketService.onNotificationUnread(handleNotificationUnread);
        socketService.onMessagesRead(handleMessagesRead);

        const interval = setInterval(() => {
            if (!socketService.isConnected()) {
                console.log('⚠️ WebSocket disconnected, polling for updates');
                loadUnreadCount();
            }
        }, 60000);

        return () => {
            socketService.off('notification-unread');
            socketService.off('messages-read');
            clearInterval(interval);
        };
    }, [user, loadUnreadCount]);

    const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

    const baseNavLinks: { path: string; label: string }[] = []

    const darkZonesLinks = [
        { path: '/interview', label: t('navbar.interviews') },
        { path: '/roadmap', label: t('navbar.roadmap') },
        { path: '/development-plan', label: t('navbar.developmentPlan') },
    ]

    const graduateNavLinks = [
        { path: '/jobs', label: t('navbar.vacancies') },
        { path: '/interview/tracker', label: t('navbar.interviewTracker') },
    ]

    const codeBattleLink = { path: '/codebattle', label: 'Code Battle' }

    const employerNavLinks = [
        { path: '/candidates', label: t('navbar.candidates') },
        { path: '/candidates/map', label: t('navbar.candidatesMap') },
        { path: '/jobs', label: t('navbar.vacancies') },
        { path: '/interview/tracker', label: t('navbar.interviewTracker') },
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
            setUser(null)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
        });
    }

    return (
        <nav className="bg-dark-surface shadow-lg border-b border-dark-card sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 w-full">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2 flex-shrink-0">
                        <div className="bg-accent-cyan px-2 py-1 rounded-lg">
                            <span className="text-xl font-mono font-bold text-dark-bg">&lt;/&gt;</span>
                        </div>
                        <span className="text-xl font-bold text-white">IT-Grads</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center flex-1 justify-center gap-4 mx-8">
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

                        {userType === 'graduate' && (
                            <div className="relative" ref={darkZonesDropdownRef}>
                                <button
                                    onClick={() => setIsDarkZonesOpen(!isDarkZonesOpen)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                                        darkZonesLinks.some(link => isActive(link.path))
                                            ? 'text-accent-cyan bg-dark-card'
                                            : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                    }`}
                                >
                                    <span>{t('navbar.darkZones', 'Области тьмы')}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isDarkZonesOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDarkZonesOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-dark-surface border border-dark-card rounded-lg shadow-lg overflow-hidden z-50">
                                        {darkZonesLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setIsDarkZonesOpen(false)}
                                                className={`block px-4 py-2.5 text-sm transition-colors ${
                                                    isActive(link.path)
                                                        ? 'bg-accent-cyan/20 text-accent-cyan'
                                                        : 'text-gray-300 hover:bg-dark-card hover:text-white'
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {userType === 'graduate' && (
                            <Link
                                to={codeBattleLink.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive(codeBattleLink.path)
                                        ? 'text-accent-cyan bg-dark-card'
                                        : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                }`}
                            >
                                {codeBattleLink.label}
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
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
                                    <span>{t('navbar.profile')}</span>
                                </Link>
                                <button
                                    onClick={logoutHandler}
                                    className="text-gray-300 hover:text-accent-cyan px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>{t('navbar.logout')}</span>
                                </button>
                                <div className="relative" ref={langDropdownRef}>
                                    <button
                                        onClick={() => setIsLangOpen(!isLangOpen)}
                                        className="text-gray-300 hover:text-accent-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 border border-dark-card hover:border-accent-cyan"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span>{currentLang.short}</span>
                                        <ChevronDown className={`h-3 w-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isLangOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-dark-surface border border-dark-card rounded-lg shadow-lg overflow-hidden z-50">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => changeLanguage(lang.code)}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                                                        i18n.language === lang.code
                                                            ? 'bg-accent-cyan/20 text-accent-cyan'
                                                            : 'text-gray-300 hover:bg-dark-card hover:text-white'
                                                    }`}
                                                >
                                                    <span>{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-accent-cyan px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>{t('navbar.login')}</span>
                                </Link>
                                <Link
                                    to="/registration"
                                    className="btn-primary text-sm"
                                >
                                    {t('navbar.register')}
                                </Link>
                                <div className="relative" ref={langDropdownRef}>
                                    <button
                                        onClick={() => setIsLangOpen(!isLangOpen)}
                                        className="text-gray-300 hover:text-accent-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 border border-dark-card hover:border-accent-cyan"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span>{currentLang.short}</span>
                                        <ChevronDown className={`h-3 w-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isLangOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-dark-surface border border-dark-card rounded-lg shadow-lg overflow-hidden z-50">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => changeLanguage(lang.code)}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                                                        i18n.language === lang.code
                                                            ? 'bg-accent-cyan/20 text-accent-cyan'
                                                            : 'text-gray-300 hover:bg-dark-card hover:text-white'
                                                    }`}
                                                >
                                                    <span>{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden ml-auto">
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

                        {userType === 'graduate' && (
                            <div>
                                <button
                                    onClick={() => setIsMobileDarkZonesOpen(!isMobileDarkZonesOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                                        darkZonesLinks.some(link => isActive(link.path))
                                            ? 'text-accent-cyan bg-dark-card'
                                            : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                    }`}
                                >
                                    <span>{t('navbar.darkZones', 'Области тьмы')}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isMobileDarkZonesOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isMobileDarkZonesOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-dark-card pl-3">
                                        {darkZonesLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    setIsMobileDarkZonesOpen(false);
                                                }}
                                                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                                    isActive(link.path)
                                                        ? 'text-accent-cyan bg-dark-card'
                                                        : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {userType === 'graduate' && (
                            <Link
                                to={codeBattleLink.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    isActive(codeBattleLink.path)
                                        ? 'text-accent-cyan bg-dark-card'
                                        : 'text-gray-300 hover:text-accent-cyan hover:bg-dark-card'
                                }`}
                            >
                                {codeBattleLink.label}
                            </Link>
                        )}

                        <div className="pt-4 space-y-2">
                            {user && userType ? (
                                <>
                                    <Link
                                        to="/messenger"
                                        onClick={() => setIsOpen(false)}
                                        className="relative flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        <span>{t('navbar.messages')}</span>
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
                                        {t('navbar.profile')}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logoutHandler()
                                            setIsOpen(false)
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        {t('navbar.logout')}
                                    </button>
                                    <div className="px-3 py-2">
                                        <p className="text-xs text-gray-500 mb-2 flex items-center">
                                            <Globe className="h-4 w-4 mr-1" />
                                            {t('navbar.language')}
                                        </p>
                                        <div className="flex space-x-2">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        changeLanguage(lang.code);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`flex-1 px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                                                        i18n.language === lang.code
                                                            ? 'bg-accent-cyan text-dark-bg'
                                                            : 'bg-dark-card text-gray-300 hover:bg-dark-surface'
                                                    }`}
                                                >
                                                    <span>{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-accent-cyan hover:bg-dark-card"
                                    >
                                        {t('navbar.login')}
                                    </Link>
                                    <Link
                                        to="/registration"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium bg-accent-cyan text-dark-bg text-center"
                                    >
                                        {t('navbar.register')}
                                    </Link>
                                    <div className="px-3 py-2">
                                        <p className="text-xs text-gray-500 mb-2 flex items-center">
                                            <Globe className="h-4 w-4 mr-1" />
                                            {t('navbar.language')}
                                        </p>
                                        <div className="flex space-x-2">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        changeLanguage(lang.code);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`flex-1 px-3 py-2 rounded-md text-sm flex items-center justify-center transition-colors ${
                                                        i18n.language === lang.code
                                                            ? 'bg-accent-cyan text-dark-bg'
                                                            : 'bg-dark-card text-gray-300 hover:bg-dark-surface'
                                                    }`}
                                                >
                                                    <span>{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
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
