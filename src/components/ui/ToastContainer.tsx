import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

export const ToastContainer: React.FC = () => {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`p-4 rounded shadow-lg cursor-pointer text-white text-sm font-mono border-l-4 backdrop-blur-md animate-in slide-in-from-right-full ${
            toast.type === 'error' ? 'bg-red-900/80 border-red-500' :
            toast.type === 'warning' ? 'bg-yellow-900/80 border-yellow-500' :
            toast.type === 'success' ? 'bg-green-900/80 border-green-500' :
            'bg-blue-900/80 border-blue-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
