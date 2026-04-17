import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  fullscreenMobile?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 480,
  fullscreenMobile = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const mobileClass = fullscreenMobile
    ? 'md:inset-auto md:rounded-2xl inset-0 rounded-none'
    : 'rounded-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Painel */}
      <div
        ref={panelRef}
        className={`relative z-10 shadow-lg flex flex-col overflow-hidden animate-slide-up ${mobileClass}`}
        style={{
          maxWidth,
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
