import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmailPending: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const email = localStorage.getItem('pendingVerificationEmail') || '';

  const handleResendEmail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Письмо отправлено повторно! Проверьте ваш email.');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Ошибка при отправке письма');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Ошибка при отправке письма');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-accent-cyan p-3 rounded-lg">
              <Mail className="h-8 w-8 text-dark-bg" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Проверьте ваш email</h2>
        </div>

        <div className="card">
          <div className="text-center space-y-6">
            <p className="text-gray-300">
              Мы отправили письмо с подтверждением на адрес:
            </p>

            <p className="text-lg font-semibold text-accent-cyan break-all">
              {email}
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                <strong>Важно:</strong> Ссылка действительна в течение 24 часов.
                Проверьте папку "Спам", если не видите письмо во входящих.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={handleResendEmail}
                className="w-full btn-primary"
              >
                Отправить письмо повторно
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-dark-surface hover:bg-dark-surface/80 text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors border border-dark-surface hover:border-gray-600"
              >
                Вернуться к входу
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPending;