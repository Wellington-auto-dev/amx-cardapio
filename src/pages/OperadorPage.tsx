import { useEffect, useState } from 'react';
import { useOperador } from '@/hooks/useOperador';

// ─── Skeleton ──────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 space-y-4 animate-pulse"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl shrink-0"
          style={{ backgroundColor: 'var(--color-surface-2)' }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          <div className="h-3 rounded-lg w-1/2" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: 'var(--color-surface-2)' }} />
      </div>
      <div className="h-9 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
    </div>
  );
}

// ─── Unauthorized ─────────────────────────────────────────────────────────

function NaoAutorizado() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <div
        className="rounded-2xl p-8 max-w-sm w-full text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: 'rgb(239 68 68 / 0.12)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7" style={{ color: '#ef4444' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-lg font-700 mb-2" style={{ color: 'var(--color-text)' }}>
          Acesso nao autorizado
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          O token de operador e invalido ou expirou. Entre em contato com o suporte para obter um novo link de acesso.
        </p>
      </div>
    </div>
  );
}

// ─── Loja card ─────────────────────────────────────────────────────────────

type Loja = {
  merchant_id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  loja_aberta: boolean;
  cardapio_ativo: boolean;
  token_admin: string;
};

function LojaCard({ loja }: { loja: Loja }) {
  const initial = loja.nome.charAt(0).toUpperCase();
  const adminUrl = `/${loja.slug}/admin?token=${loja.token_admin}`;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {loja.logo_url ? (
          <img
            src={loja.logo_url}
            alt={loja.nome}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
            style={{ border: '1px solid var(--color-border)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-700 shrink-0"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-700 truncate" style={{ color: 'var(--color-text)' }}>
            {loja.nome}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            /{loja.slug}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-600"
          style={{
            backgroundColor: loja.loja_aberta ? 'rgb(34 197 94 / 0.12)' : 'rgb(239 68 68 / 0.12)',
            color: loja.loja_aberta ? '#22c55e' : '#ef4444',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: loja.loja_aberta ? '#22c55e' : '#ef4444' }}
          />
          {loja.loja_aberta ? 'Aberta' : 'Fechada'}
        </span>

        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-600"
          style={{
            backgroundColor: loja.cardapio_ativo ? 'rgb(245 166 35 / 0.12)' : 'rgb(100 116 139 / 0.12)',
            color: loja.cardapio_ativo ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}
        >
          {loja.cardapio_ativo ? 'Cardapio Ativo' : 'Cardapio Inativo'}
        </span>
      </div>

      {/* Action */}
      <a
        href={adminUrl}
        className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-700 transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', textDecoration: 'none' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Gerenciar
      </a>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function OperadorPage() {
  const { operador, lojas, isLoading, isError } = useOperador();

  const [tema, setTema] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('amx-tema') as 'dark' | 'light') || 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('amx-tema', tema);
  }, [tema]);

  if (isError) return <NaoAutorizado />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--color-primary)' }}>
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-sm font-700" style={{ color: 'var(--color-text)' }}>
            Painel Operador
          </span>
        </div>

        <button
          onClick={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-60"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
          aria-label={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
        >
          {tema === 'dark' ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-6 w-48 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
              <div className="h-4 w-32 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-700" style={{ color: 'var(--color-text)' }}>
                Ola, {operador?.nome}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {lojas.length === 1
                  ? '1 loja vinculada ao seu acesso'
                  : `${lojas.length} lojas vinculadas ao seu acesso`}
              </p>
            </>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : lojas.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Nenhuma loja vinculada a este operador.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lojas.map((loja) => (
              <LojaCard key={loja.merchant_id} loja={loja} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
