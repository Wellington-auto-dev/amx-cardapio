import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const startY = useRef<number | null>(null);

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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 rounded-t-3xl flex flex-col max-h-[85vh] animate-slide-up"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
        }}
        onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (startY.current !== null) {
            const delta = e.changedTouches[0].clientY - startY.current;
            if (delta > 60) onClose();
          }
          startY.current = null;
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {title && (
          <div className="px-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
