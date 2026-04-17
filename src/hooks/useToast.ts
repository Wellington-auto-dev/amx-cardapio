import { useState, useCallback } from 'react';
import type { ToastMessage, ToastType } from '@/types/admin';

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Remove automaticamente após 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
