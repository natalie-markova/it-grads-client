import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Введите email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await $api.post('/auth/forgot-password', { email });
      toast.success(response.data.message || 'Письмо с инструкциями отправлено');
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка при отправке запроса';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-accent-cyan" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Проверьте email</h2>
            <p className="text-gray-400 mb-6">
              Если аккаунт с указанным email существует, вы получите письмо с инструкциями по восстановлению пароля.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Не пришло письмо? Проверьте папку "Спам" или повторите попытку через несколько минут.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full bg-accent-cyan text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-cyan/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться к входу
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
          <h2 className="text-3xl font-bold text-white mb-2">Забыли пароль?</h2>
          <p className="text-gray-400">
            Введите email, и мы отправим вам инструкции по восстановлению пароля
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ваш@email.com"
              className="w-full bg-dark-card border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-accent-cyan transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-cyan text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Отправка...' : 'Отправить инструкции'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan/80 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться к входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
