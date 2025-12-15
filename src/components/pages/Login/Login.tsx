import { FormEvent, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { $api, setAccessToken } from "../../../utils/axios.instance";
import { useNavigate, useOutletContext } from "react-router-dom";
import { OutletContext } from "../../../types";
import toast from "react-hot-toast";

const REMEMBERED_EMAIL_KEY = 'rememberedEmail';
const REMEMBERED_PASSWORD_KEY = 'rememberedPassword';

function Login() {
    const { setUser } = useOutletContext<OutletContext>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [savedEmail, setSavedEmail] = useState<string>('');
    const [savedPassword, setSavedPassword] = useState<string>('');

    useEffect(() => {
        const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
        const rememberedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY);

        if (rememberedEmail) {
            setSavedEmail(rememberedEmail);
            setRememberMe(true);
        }

        if (rememberedPassword) {
            try {
                const decodedPassword = atob(rememberedPassword);
                setSavedPassword(decodedPassword);
            } catch (error) {
                console.error('Error decoding password:', error);
                localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
            }
        }
    }, []);

    // Google OAuth handler
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const response = await $api.post('/users/google', {
                credential: credentialResponse.credential
            });

            console.log("Google login response:", response.data);
            toast.success(t('toasts.loginSuccess'));
            setAccessToken(response.data.accessToken);
            setUser(response.data.user);

            const userRole = response.data.user?.role || 'graduate';
            navigate(`/profile/${userRole}`);
        } catch (error: any) {
            console.error("Google login error:", error.response?.data || error.message);
            toast.error(t('toasts.loginError'));
        }
    };

    const handleGoogleError = () => {
        console.error("Google login failed");
        toast.error(t('toasts.loginError'));
    };
    
    function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        const data = {
            email,
            password
        };
        
        $api.post("/users/login", data)
        .then(data => {
            console.log("Response:", data.data);
            toast.success(t('toasts.loginSuccess'));
            setAccessToken(data.data.accessToken)
            setUser(data.data.user)

            if (rememberMe) {
                localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
                const encodedPassword = btoa(password);
                localStorage.setItem(REMEMBERED_PASSWORD_KEY, encodedPassword);
            } else {
                localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
            }
            
            const userRole = data.data.user?.role || 'graduate'
            navigate(`/profile/${userRole}`);
        })
        .catch(error => {
            console.error("Что-то пошло не так:", error.response?.data || error.message);
            toast.error(t('toasts.loginError'));
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
                                    defaultValue={savedEmail}
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
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                    defaultValue={savedPassword}
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
                        </div>

                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="rememberMe"
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-5 w-5 text-accent-cyan focus:ring-accent-cyan border-gray-600 rounded bg-dark-card cursor-pointer appearance-none checked:bg-accent-cyan checked:border-accent-cyan transition-colors"
                                    />
                                    {rememberMe && (
                                        <Check className="h-5 w-5 text-dark-bg absolute pointer-events-none" />
                                    )}
                                </div>
                                <span className="text-gray-300 text-sm">
                                    {t('auth.rememberMe') || 'Запомнить меня'}
                                </span>
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-accent-cyan hover:text-accent-cyan/80 transition-colors text-sm"
                            >
                                Забыли пароль?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full"
                        >
                            {t('auth.loginButton')}
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
                                text="signin_with"
                                shape="rectangular"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
