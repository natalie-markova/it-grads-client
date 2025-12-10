import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';
import { OutletContext } from '../../../types';

const VerifyEmailSuccess: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await $api.get(`/auth/verify-email/${token}`);

        if (response.data.user) {
          // Обновляем данные пользователя в localStorage
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = {
            ...currentUser,
            emailVerified: true
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));

          // Обновляем контекст если пользователь залогинен
          if (context?.setUser) {
            context.setUser(updatedUser);
          }
        }

        setStatus('success');

        // Определяем куда редиректить
        const isLoggedIn = !!localStorage.getItem('accessToken');
        let redirectPath = '/login';

        if (isLoggedIn) {
          // Получаем роль пользователя из localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              redirectPath = `/profile/${user.role || 'graduate'}`;
            } catch {
              redirectPath = '/profile/graduate';
            }
          } else {
            redirectPath = '/profile/graduate';
          }
        }

        // Автоматический редирект через 3 секунды
        setTimeout(() => {
          navigate(redirectPath);
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

  const isLoggedIn = !!localStorage.getItem('accessToken');
  let redirectPath = '/login';

  if (isLoggedIn) {
    // Получаем роль пользователя из localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        redirectPath = `/profile/${user.role || 'graduate'}`;
      } catch {
        redirectPath = '/profile/graduate';
      }
    } else {
      redirectPath = '/profile/graduate';
    }
  }

  const redirectText = isLoggedIn
    ? 'Вы будете автоматически перенаправлены в личный кабинет через 3 секунды...'
    : 'Вы будете автоматически перенаправлены на страницу входа через 3 секунды...';
  const buttonText = isLoggedIn ? 'Перейти в личный кабинет' : 'Перейти к входу';

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
              {redirectText}
            </p>

            <button
              onClick={() => navigate(redirectPath)}
              className="w-full btn-primary"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;