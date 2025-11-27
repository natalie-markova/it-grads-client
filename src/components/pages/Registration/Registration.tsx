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
    
    function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            username: formData.get('login') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            role: role,
        };
        $api.post("/users/registration", data)
        .then((response) => {
            console.log("Response:", response.data)
            if (response.status === 200) {
                setAccessToken(response.data.accessToken)
                setUser(response.data.user)
                navigate("/main")
            }
        })
        .catch(error => {
            console.error("Что-то пошло не так:", error.response?.data || error.message);
            toast.error("Ошибка регистрации. Пользователь с такими данными уже зарегестрирован.")
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
                                    className="input-field pl-10"
                                    placeholder="your@email.com"
                                />
                            </div>
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
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                />
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
