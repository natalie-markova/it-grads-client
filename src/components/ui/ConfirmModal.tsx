import React from 'react';
import Card from './Card';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const buttonStyles = {
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
    warning: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400',
    info: 'bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
      onClick={onCancel}
    >
      <Card
        className="max-w-md w-full"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white">
              {title}
            </h3>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-300 mb-6">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className={`${buttonStyles[variant]} px-4 py-2 rounded-lg font-medium transition-colors flex-1`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;

