import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';

const VerifyEmailSuccess: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await $api.get(`/api/auth/verify-email/${token}`);

        if (response.data.user) {
          // Обновляем данные пользователя в localStorage
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            emailVerified: true
          }));
        }

        setStatus('success');

        // Автоматический редирект через 3 секунды
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.error || 'Ошибка при верификации email');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-cyan mx-auto mb-4"></div>
          <p className="text-gray-300">Проверка email...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Ошибка верификации</h2>
          </div>

          <div className="card">
            <div className="text-center space-y-6">
              <p className="text-gray-300">
                {errorMessage}
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full btn-primary"
              >
                Перейти к входу
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Email подтвержден!</h2>
        </div>

        <div className="card">
          <div className="text-center space-y-6">
            <p className="text-gray-300">
              Ваш email успешно подтвержден. Теперь вам доступны все возможности платформы IT-Grads!
            </p>

            <p className="text-sm text-gray-400">
              Вы будете автоматически перенаправлены на страницу входа через 3 секунды...
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full btn-primary"
            >
              Перейти к входу сейчас
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;