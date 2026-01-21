import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-surface-light/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto animate-fade-in"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
          <h2 className="text-lg font-semibold text-dark-100">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
