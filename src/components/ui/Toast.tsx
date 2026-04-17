import type { ToastMessage } from '@/types/admin';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const icons = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

const styles: Record<string, { icon: string; bg: string; border: string; text: string }> = {
  success: { icon: '#34D399', bg: 'rgb(16 185 129 / 0.12)',  border: 'rgb(52 211 153 / 0.2)',  text: '#F5F5F5' },
  error:   { icon: '#F87171', bg: 'rgb(239 68 68 / 0.12)',   border: 'rgb(248 113 113 / 0.2)', text: '#F5F5F5' },
  warning: { icon: '#FBBF24', bg: 'rgb(245 166 35 / 0.12)',  border: 'rgb(251 191 36 / 0.2)',  text: '#F5F5F5' },
  info:    { icon: '#60A5FA', bg: 'rgb(96 165 250 / 0.12)',  border: 'rgb(96 165 250 / 0.2)',  text: '#F5F5F5' },
};

export function Toast({ toast, onClose }: ToastProps) {
  const s = styles[toast.type];

  return (
    <div
      className="flex gap-3 p-4 rounded-2xl animate-toast-in min-w-72 max-w-sm backdrop-blur-sm"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5" style={{ color: s.icon }}>
        {icons[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-600" style={{ color: s.text }}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Fechar notificação"
        className="flex-shrink-0 hover:opacity-100 transition-opacity opacity-50"
        style={{ color: s.text }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: import('@/types/admin').ToastMessage[];
  onClose: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}
