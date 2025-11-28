import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { $api, setAccessToken } from "../../../utils/axios.instance";
import { useNavigate, useOutletContext } from "react-router-dom";
import { OutletContext } from "../../../types";
import toast from "react-hot-toast";

function Registration() {
    const { setUser } = useOutletContext<OutletContext>();
    const navigate = useNavigate();
    const [role, setRole] = useState<'graduate' | 'employer'>('graduate');
    const [passwordError, setPasswordError] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    
    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Некорректный формат email');
            return false;
        }
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
    
    function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        // Сбрасываем предыдущие ошибки
        setEmailError('');
        setPasswordError('');
        
        // Валидация email
        if (!validateEmail(email)) {
            return;
        }
        
        // Валидация пароля
        if (!validatePassword(password)) {
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
                toast.success("Регистрация прошла успешно!")
                // Auto login after registration
                return $api.post("/users/login", {
                    email: data.email,
                    password: data.password
                });
            }
        })
        .then((loginResponse) => {
            if (loginResponse) {
                setAccessToken(loginResponse.data.accessToken)
                setUser(loginResponse.data.user)
                const userRole = loginResponse.data.user?.role || 'graduate'
                navigate(`/profile/${userRole}`);
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
                    <h2 className="text-3xl font-bold text-white">Создать аккаунт</h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="font-medium text-accent-cyan hover:text-accent-blue">
                            Войдите
                        </Link>
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label htmlFor="login" className="block text-sm font-medium text-gray-300 mb-2">
                                Логин
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
                                    placeholder="Ваш логин"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
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
                                Пароль
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    className={`input-field pl-10 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="••••••••"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            validatePassword(e.target.value);
                                        } else {
                                            setPasswordError('');
                                        }
                                    }}
                                />
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-red-500 mb-2">
                                    Для обеспечения безопасности, ваш пароль должен соответствовать следующим требованиям:
                                </p>
                                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                                    <li>не менее 8 символов;</li>
                                    <li>включает минимум 1 заглавную и 1 строчную букву (A-Z, a-z):</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Роль
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
                                    <span className="text-gray-300">Выпускник</span>
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
                                    <span className="text-gray-300">Работодатель</span>
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary w-full"
                        >
                            Создать аккаунт
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Registration;
