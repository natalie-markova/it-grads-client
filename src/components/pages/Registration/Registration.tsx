import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { $api, setAccessToken } from "../../../utils/axios.instance";
import { useNavigate, useOutletContext } from "react-router-dom";
import { OutletContext } from "../../../types";
import toast from "react-hot-toast";

function Registration() {
    const { setUser } = useOutletContext<OutletContext>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [role, setRole] = useState<'graduate' | 'employer'>('graduate');
    const [passwordError, setPasswordError] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
    const [passwordValue, setPasswordValue] = useState<string>('');
    
    function validateEmail(email: string): boolean {
        // Убираем пробелы в начале и конце
        const trimmedEmail = email.trim();
        
        // Проверка на пустой email
        if (!trimmedEmail) {
            setEmailError('');
            return false;
        }
        
        // Проверка на пробелы внутри email
        if (email.includes(' ')) {
            setEmailError('Email не должен содержать пробелы');
            return false;
        }
        
        // Проверка на наличие символа @
        if (!trimmedEmail.includes('@')) {
            setEmailError('Email должен содержать символ @');
            return false;
        }
        
        // Проверка на количество символов @ (должен быть только один)
        const atCount = (trimmedEmail.match(/@/g) || []).length;
        if (atCount > 1) {
            setEmailError('Email должен содержать только один символ @');
            return false;
        }
        
        // Разделяем на локальную и доменную части
        const [localPart, domainPart] = trimmedEmail.split('@');
        
        // Проверка локальной части (до @)
        if (!localPart || localPart.length === 0) {
            setEmailError('Введите адрес домена почтовой платформы (например, gmail)');
            return false;
        }
        
        if (localPart.length > 64) {
            setEmailError('Часть до символа @ слишком длинная (максимум 64 символа)');
            return false;
        }
        
        // Проверка на недопустимые символы в локальной части
        const invalidLocalChars = /[<>()[\]\\,;:"\s]/;
        if (invalidLocalChars.test(localPart)) {
            setEmailError('Часть до символа @ содержит недопустимые символы (<>()[]\\,;:")');
            return false;
        }
        
        // Проверка доменной части (после @)
        if (!domainPart || domainPart.length === 0) {
            setEmailError('Введите адрес домена почтовой платформы (например, gmail)');
            return false;
        }
        
        // Проверка на точку в доменной части
        if (!domainPart.includes('.')) {
            setEmailError('Введите . и доменную зону (например, .com)');
            return false;
        }
        
        // Проверка на точку в начале или конце домена
        if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
            setEmailError('Домен не может начинаться или заканчиваться точкой');
            return false;
        }
        
        // Проверка на две точки подряд
        if (domainPart.includes('..')) {
            setEmailError('Домен не может содержать две точки подряд');
            return false;
        }
        
        // Разделяем домен на части по точкам
        const domainParts = domainPart.split('.');
        const tld = domainParts[domainParts.length - 1];
        
        // Проверка TLD (последняя часть после последней точки)
        if (!tld || tld.length < 2) {
            setEmailError('Доменное расширение (после последней точки) должно быть не менее 2 символов');
            return false;
        }
        
        if (tld.length > 63) {
            setEmailError('Доменное расширение слишком длинное');
            return false;
        }
        
        // Проверка на недопустимые символы в домене
        const invalidDomainChars = /[<>()[\]\\,;:"\s@]/;
        if (invalidDomainChars.test(domainPart)) {
            setEmailError('Домен содержит недопустимые символы');
            return false;
        }
        
        // Проверка на дефисы в начале или конце домена
        if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
            setEmailError('Домен не может начинаться или заканчиваться дефисом');
            return false;
        }
        
        // Если все проверки пройдены
        setEmailError('');
        return true;
    }
    
    function validatePassword(password: string): boolean {
        if (password.length < 8) {
            setPasswordError('invalid');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setPasswordError('invalid');
            return false;
        }
        if (!/[a-z]/.test(password)) {
            setPasswordError('invalid');
            return false;
        }
        setPasswordError('');
        return true;
    }

    const isPasswordValid = (password: string): boolean => {
        return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password);
    };
    
    function validatePasswordMatch(password: string, confirmPassword: string): boolean {
        if (confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError('Пароли не совпадают');
            return false;
        }
        setConfirmPasswordError('');
        return true;
    }

    // Google OAuth handler
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const response = await $api.post('/users/google', {
                credential: credentialResponse.credential,
                role: role // передаём выбранную роль
            });

            console.log("Google registration response:", response.data);
            toast.success(t('toasts.loginSuccess'));
            setAccessToken(response.data.accessToken);
            setUser(response.data.user);

            const userRole = response.data.user?.role || 'graduate';
            navigate(`/profile/${userRole}`);
        } catch (error: any) {
            console.error("Google registration error:", error.response?.data || error.message);
            toast.error(t('toasts.registrationError') || 'Ошибка регистрации через Google');
        }
    };

    const handleGoogleError = () => {
        console.error("Google registration failed");
        toast.error(t('toasts.registrationError') || 'Ошибка регистрации через Google');
    };

    function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        
        // Сбрасываем предыдущие ошибки
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        
        // Валидация email
        if (!validateEmail(email)) {
            return;
        }
        
        // Валидация пароля
        if (!validatePassword(password)) {
            return;
        }
        
        // Валидация совпадения паролей
        if (!validatePasswordMatch(password, confirmPassword)) {
            return;
        }
        
        const data = {
            username: formData.get('login') as string,
            email: email,
            password: password,
            role: role,
        };
        
        $api.post("/users/registration", data)
        .then((response) => {
            console.log("Response:", response.data)
            if (response.status === 200) {
                toast.success("Регистрация прошла успешно! Проверьте ваш email.")

                // Сохраняем email для страницы верификации
                localStorage.setItem('pendingVerificationEmail', data.email);

                // Сохраняем токен для возможности переотправки письма
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);

                // Редирект на страницу проверки email
                navigate('/verify-email-pending');
            }
        })
        .catch(error => {
            console.error("Что-то пошло не так:", error.response?.data || error.message);
            
            // Обработка различных типов ошибок
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || '';
            const statusCode = error.response?.status;
            
            // Проверка на ошибку формата email
            if (
                statusCode === 400 || 
                errorMessage.toLowerCase().includes('email') && 
                (errorMessage.toLowerCase().includes('invalid') || 
                errorMessage.toLowerCase().includes('format') ||
                errorMessage.toLowerCase().includes('некорректн'))
            ) {
                setEmailError('Некорректный формат email');
                toast.error('Пожалуйста, введите корректный email адрес');
                return;
            }
            
            // Проверка на существующего пользователя
            if (
                statusCode === 409 || 
                errorMessage.toLowerCase().includes('уже существует') ||
                errorMessage.toLowerCase().includes('already exists') ||
                errorMessage.toLowerCase().includes('зарегестрирован')
            ) {
                toast.error('Пользователь с такими данными уже зарегистрирован');
                return;
            }
            
            // Общая ошибка
            toast.error(errorMessage || 'Ошибка регистрации. Попробуйте еще раз.');
        });

    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-accent-cyan p-3 rounded-lg">
                            <UserPlus className="h-8 w-8 text-dark-bg" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">{t('auth.register')}</h2>
                    <p className="mt-2 text-sm text-gray-300">
                        {t('auth.hasAccount')}{' '}
                        <Link to="/login" className="font-medium text-accent-cyan hover:text-accent-blue">
                            {t('auth.loginButton')}
                        </Link>
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label htmlFor="login" className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.username')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    id="login"
                                    name="login"
                                    required
                                    className="input-field pl-10"
                                    placeholder={t('auth.username')}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className={`input-field pl-10 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="your@email.com"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            validateEmail(e.target.value);
                                        } else {
                                            setEmailError('');
                                        }
                                    }}
                                />
                            </div>
                            {emailError && (
                                <p className="mt-1 text-sm text-red-500">{emailError}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    className={`input-field pl-10 pr-10 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="••••••••"
                                    onFocus={() => setPasswordTouched(true)}
                                    onChange={(e) => {
                                        const password = e.target.value;
                                        setPasswordValue(password);
                                        setPasswordTouched(true);
                                        if (password) {
                                            validatePassword(password);
                                            // Проверяем совпадение с подтверждением, если оно уже введено
                                            const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value || '';
                                            if (confirmPassword) {
                                                validatePasswordMatch(password, confirmPassword);
                                            }
                                        } else {
                                            setPasswordError('');
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {passwordTouched && !isPasswordValid(passwordValue) && (
                                <div className="mt-2">
                                    <p className="text-sm text-red-500 mb-2">
                                        Для обеспечения безопасности, ваш пароль должен соответствовать следующим требованиям:
                                    </p>
                                    <ul className="text-sm text-red-500 space-y-1 list-disc list-inside">
                                        <li>не менее 8 символов;</li>
                                        <li>включает минимум 1 заглавную и 1 строчную букву (A-Z, a-z):</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Подтверждение пароля
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    className={`input-field pl-10 pr-10 ${confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="••••••••"
                                    onChange={(e) => {
                                        const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
                                        if (e.target.value) {
                                            validatePasswordMatch(password, e.target.value);
                                        } else {
                                            setConfirmPasswordError('');
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {confirmPasswordError && (
                                <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.chooseRole')}
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="graduate"
                                        checked={role === 'graduate'}
                                        onChange={(e) => setRole(e.target.value as 'graduate' | 'employer')}
                                        className="h-4 w-4 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-surface"
                                        required
                                    />
                                    <span className="text-gray-300">{t('auth.graduate')}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="employer"
                                        checked={role === 'employer'}
                                        onChange={(e) => setRole(e.target.value as 'graduate' | 'employer')}
                                        className="h-4 w-4 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-surface"
                                        required
                                    />
                                    <span className="text-gray-300">{t('auth.employer')}</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full"
                        >
                            {t('auth.registerButton')}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-dark-card text-gray-400">{t('auth.or') || 'или'}</span>
                            </div>
                        </div>

                        <div className="flex justify-center google-login-wrapper">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                size="large"
                                text="signup_with"
                                shape="rectangular"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Registration;
