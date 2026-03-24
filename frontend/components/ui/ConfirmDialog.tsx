import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-gray-600 font-medium leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-xs font-black tracking-widest uppercase border-gray-200"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            className={`px-8 py-2 text-xs font-black tracking-widest uppercase shadow-lg hover:shadow-xl transition-all ${
              variant === 'danger' 
                ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800' 
                : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
