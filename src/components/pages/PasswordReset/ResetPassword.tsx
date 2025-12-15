import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }

    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      const response = await $api.post(`/auth/reset-password/${token}`, { password });
      toast.success(response.data.message || 'Пароль успешно изменён');
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка при сбросе пароля';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Пароль изменён!</h2>
            <p className="text-gray-400 mb-6">
              Ваш пароль успешно изменён. Сейчас вы будете перенаправлены на страницу входа.
            </p>
            <div className="text-sm text-gray-500">
              Перенаправление через 3 секунды...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && error.includes('истёкшая')) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Ссылка недействительна</h2>
            <p className="text-gray-400 mb-6">
              Срок действия ссылки для сброса пароля истёк или она уже была использована.
            </p>
            <Link
              to="/forgot-password"
              className="w-full inline-block bg-accent-cyan text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-cyan/90 transition-colors text-center"
            >
              Запросить новую ссылку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-accent-cyan" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Новый пароль</h2>
          <p className="text-gray-400">
            Введите новый пароль для вашего аккаунта
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Новый пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full bg-dark-card border border-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-accent-cyan transition-colors"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Подтвердите пароль
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
                className="w-full bg-dark-card border border-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-accent-cyan transition-colors"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-cyan text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Сохранение...' : 'Изменить пароль'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-accent-cyan hover:text-accent-cyan/80 transition-colors text-sm"
            >
              Вернуться к входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
