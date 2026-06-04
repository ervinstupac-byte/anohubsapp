import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Z_INDEX, TRANSITIONS, GLASS, RADIUS } from '../../design-tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-5xl',
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 flex items-center justify-center p-4 ${Z_INDEX.modal}`}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className={`relative w-full ${sizeClasses[size]} ${GLASS.floating} rounded-xl shadow-2xl animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-4 border-b border-slate-700/50 ${headerClassName}`}>
            {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg ${TRANSITIONS.fast}`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`p-6 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
