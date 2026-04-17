import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface TokenGuardProps {
  state: 'loading' | 'authorized' | 'unauthorized';
  children: ReactNode;
}

export function TokenGuard({ state, children }: TokenGuardProps) {
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (state === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgb(239 68 68 / 0.1)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8" style={{ color: '#F87171' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-700 mb-2" style={{ color: 'var(--color-text)' }}>Acesso não autorizado</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            O link de acesso é inválido ou expirou. Entre em contato com o suporte para obter um novo link de acesso ao painel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function InlineLoader() {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      <div
        className="w-4 h-4 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
      />
      Processando...
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    </div>
  );
}
