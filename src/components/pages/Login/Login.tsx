import { FormEvent } from "react";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { $api, setAccessToken } from "../../../utils/axios.instance";
import { useNavigate, useOutletContext } from "react-router-dom";
import { OutletContext } from "../../../types";
import toast from "react-hot-toast";

function Login() {
    const { setUser } = useOutletContext<OutletContext>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string
        };
        $api.post("/users/login", data)
        .then(data => {
            console.log("Response:", data.data);
            toast.success("Авторизация прошла успешно!");
            setAccessToken(data.data.accessToken)
            setUser(data.data.user)
            const userRole = data.data.user?.role || 'graduate'
            navigate(`/profile/${userRole}`);
        })
        .catch(error => {
            console.error("Что-то пошло не так:", error.response?.data || error.message);
            toast.error("Ошибка авторизации. Проверьте логин и пароль.");
        });
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-accent-cyan p-3 rounded-lg">
                            <LogIn className="h-8 w-8 text-dark-bg" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">{t('auth.login')}</h2>
                    <p className="mt-2 text-sm text-gray-300">
                        {t('auth.noAccount')}{' '}
                        <Link to="/registration" className="font-medium text-accent-cyan hover:text-accent-blue">
                            {t('auth.registerButton')}
                        </Link>
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={submitHandler} className="space-y-6">
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
                                    className="input-field pl-10"
                                    placeholder="your@email.com"
                                />
                            </div>
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
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full"
                        >
                            {t('auth.loginButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
