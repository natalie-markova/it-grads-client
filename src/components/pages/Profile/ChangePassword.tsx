import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Card from '../../ui/Card';
import toast from 'react-hot-toast';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [samePasswordError, setSamePasswordError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Пароль должен быть не менее 8 символов');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Пароль должен содержать хотя бы одну заглавную букву');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Пароль должен содержать хотя бы одну строчную букву');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Пароли не совпадают');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateDifferentPasswords = (currentPassword: string, newPassword: string): boolean => {
    if (currentPassword && newPassword && currentPassword === newPassword) {
      setSamePasswordError('Новый и старый пароли не могут совпадать');
      return false;
    }
    setSamePasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сбрасываем ошибки
    setPasswordError('');
    setConfirmPasswordError('');
    setSamePasswordError('');

    if (!currentPassword) {
      toast.error('Введите текущий пароль');
      return;
    }

    // Валидация
    if (!validatePassword(newPassword)) {
      return;
    }

    if (!validatePasswordMatch(newPassword, confirmPassword)) {
      return;
    }

    if (!validateDifferentPasswords(currentPassword, newPassword)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const baseUrl = API_URL.replace('/api', '');
      const accessToken = localStorage.getItem('accessToken') || '';
      
      await axios.put(`${baseUrl}/auth/change-password`, {
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true
      });

      toast.success('Пароль успешно изменен');
      
      // Очищаем поля
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при смене пароля';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Смена пароля</h2>
        <p className="text-gray-400 text-sm">Измените ваш пароль для обеспечения безопасности аккаунта</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Текущий пароль */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Текущий пароль
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => {
                  const password = e.target.value;
                  setCurrentPassword(password);
                  // Проверяем, что новый пароль отличается от старого, если новый пароль уже введен
                  if (newPassword) {
                    validateDifferentPasswords(password, newPassword);
                  }
                }}
                required
                className="input-field pl-10 pr-10"
                placeholder="Введите текущий пароль"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Новый пароль */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Новый пароль
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  const password = e.target.value;
                  setNewPassword(password);
                  if (password) {
                    validatePassword(password);
                    // Проверяем совпадение с подтверждением, если оно уже введено
                    if (confirmPassword) {
                      validatePasswordMatch(password, confirmPassword);
                    }
                    // Проверяем, что новый пароль отличается от старого
                    if (currentPassword) {
                      validateDifferentPasswords(currentPassword, password);
                    }
                  } else {
                    setPasswordError('');
                    setSamePasswordError('');
                  }
                }}
                required
                className={`input-field pl-10 pr-10 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Введите новый пароль"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
            {samePasswordError && (
              <p className="mt-1 text-sm text-red-500">{samePasswordError}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-400 mb-2">
                Требования к паролю:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>не менее 8 символов</li>
                <li>включает минимум 1 заглавную и 1 строчную букву (A-Z, a-z)</li>
              </ul>
            </div>
          </div>

          {/* Подтверждение пароля */}
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
                value={confirmPassword}
                onChange={(e) => {
                  const confirm = e.target.value;
                  setConfirmPassword(confirm);
                  if (confirm) {
                    validatePasswordMatch(newPassword, confirm);
                  } else {
                    setConfirmPasswordError('');
                  }
                }}
                required
                className={`input-field pl-10 pr-10 ${confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Подтвердите новый пароль"
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

          {/* Кнопка отправки */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;

