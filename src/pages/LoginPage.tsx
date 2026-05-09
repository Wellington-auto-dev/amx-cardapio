import { SignIn } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [tema] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('amx-tema') as 'dark' | 'light') || 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" style={{ color: 'var(--color-primary)' }}>
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-xl font-700" style={{ color: 'var(--color-text)' }}>
            AMX — Painel do Operador
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Acesse com sua conta Google para continuar
        </p>
      </div>

      <SignIn
        path="/operador/login"
        routing="path"
        signUpUrl={false as unknown as string}
        appearance={{
          variables: {
            colorPrimary: '#F5A623',
            colorBackground: 'var(--color-surface)',
            colorText: 'var(--color-text)',
            colorTextSecondary: 'var(--color-text-muted)',
            colorInputBackground: 'var(--color-surface-2)',
            colorInputText: 'var(--color-text)',
            borderRadius: '12px',
          },
          elements: {
            card: {
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'none',
            },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
            socialButtonsBlockButton: {
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            },
            dividerLine: { backgroundColor: 'var(--color-border)' },
            dividerText: { color: 'var(--color-text-muted)' },
            formFieldInput: {
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            },
            formButtonPrimary: {
              backgroundColor: '#F5A623',
              color: '#0D0D0D',
            },
            footerActionLink: { color: '#F5A623' },
          },
        }}
      />
    </div>
  );
}
