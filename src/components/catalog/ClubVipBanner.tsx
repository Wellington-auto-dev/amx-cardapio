import { useState } from 'react';

interface ProximoNivel {
  meta_pontos: number;
  brinde: string;
  faltam?: number;
}

interface ClubVipBannerProps {
  phone: string | null;
  setPhone: (phone: string) => void;
  clubAtivo: boolean;
  pontosAtuais: number;
  pontosPorCompra: number;
  proximoNivel: ProximoNivel | null;
  isLoading: boolean;
  hasChecked: boolean;
}

// ─── Ícone estrela ─────────────────────────────────────────────────────────

function StarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ─── Modo: captura de telefone ──────────────────────────────────────────────

function PhonePrompt({ setPhone }: { setPhone: (p: string) => void }) {
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = () => {
    const digits = draft.replace(/\D/g, '');
    if (digits.length >= 10) {
      setPhone(digits);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-600 transition-opacity hover:opacity-80"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ color: 'var(--color-primary)' }}>
          <StarIcon />
        </span>
        <span style={{ color: 'var(--color-text)' }}>Club VIP</span>
        <span className="flex-1" style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 500 }}>
          — Informe seu telefone para ver seus pontos
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'var(--color-primary)' }}><StarIcon /></span>
        <p className="text-sm font-700" style={{ color: 'var(--color-text)' }}>Club VIP</p>
      </div>
      <div className="flex gap-2">
        <input
          type="tel"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          placeholder="(11) 99999-9999"
          autoFocus
          className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <button
          onClick={handleConfirm}
          disabled={draft.replace(/\D/g, '').length < 10}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-700 transition-opacity disabled:opacity-40 hover:opacity-85"
          style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', border: 'none', cursor: 'pointer' }}
        >
          Ver pontos
        </button>
        <button
          onClick={() => setExpanded(false)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-60 flex-shrink-0"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Fechar"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Modo: loading do saldo ────────────────────────────────────────────────

function BannerSkeleton() {
  return (
    <div
      className="rounded-2xl px-4 py-4 animate-pulse"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          <div className="w-20 h-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        </div>
        <div className="w-16 h-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface-2)' }} />
      </div>
      <div className="w-48 h-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--color-surface-2)' }} />
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-surface-2)' }} />
    </div>
  );
}

// ─── Modo: exibir pontos ───────────────────────────────────────────────────

function PointsDisplay({
  pontosAtuais,
  pontosPorCompra,
  proximoNivel,
  phone,
  setPhone,
}: {
  pontosAtuais: number;
  pontosPorCompra: number;
  proximoNivel: ProximoNivel | null;
  phone: string;
  setPhone: (p: string) => void;
}) {
  const pct = proximoNivel
    ? Math.min(100, Math.round((pontosAtuais / proximoNivel.meta_pontos) * 100))
    : 100;

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-primary)' }}><StarIcon /></span>
          <p className="text-sm font-700" style={{ color: 'var(--color-text)' }}>Club VIP</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-700 px-2.5 py-1 rounded-xl"
            style={{ backgroundColor: 'rgb(245 166 35 / 0.12)', color: 'var(--color-primary)' }}
          >
            {pontosAtuais} {pontosAtuais === 1 ? 'ponto' : 'pontos'}
          </span>
          <button
            onClick={() => setPhone('')}
            title="Trocar telefone"
            className="opacity-30 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ganho no pedido */}
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        Voce ganha{' '}
        <span className="font-700" style={{ color: 'var(--color-primary)' }}>
          +{pontosPorCompra} {pontosPorCompra === 1 ? 'ponto' : 'pontos'}
        </span>{' '}
        ao finalizar este pedido
      </p>

      {proximoNivel ? (
        <>
          {/* Próximo nível */}
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Proximo:{' '}
              <span className="font-600" style={{ color: 'var(--color-text)' }}>{proximoNivel.brinde}</span>
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {proximoNivel.faltam != null
                ? `faltam ${proximoNivel.faltam} pts`
                : `${pontosAtuais}/${proximoNivel.meta_pontos} pts`}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
        </>
      ) : (
        <p className="text-xs font-600" style={{ color: '#10B981' }}>
          Parabens! Voce ja atingiu todos os niveis do Club VIP.
        </p>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function ClubVipBanner({
  phone,
  setPhone,
  clubAtivo,
  pontosAtuais,
  pontosPorCompra,
  proximoNivel,
  isLoading,
  hasChecked,
}: ClubVipBannerProps) {
  console.log('[ClubVipBanner] render — phone:', phone, 'isLoading:', isLoading, 'hasChecked:', hasChecked, 'clubAtivo:', clubAtivo);

  // Com phone e loading (ou ainda não verificou): mostrar skeleton
  if (phone && (isLoading || !hasChecked)) return <BannerSkeleton />;

  // Com phone e club ativo: mostrar pontos
  if (phone && clubAtivo) {
    return (
      <PointsDisplay
        pontosAtuais={pontosAtuais}
        pontosPorCompra={pontosPorCompra}
        proximoNivel={proximoNivel}
        phone={phone}
        setPhone={setPhone}
      />
    );
  }

  // Com phone, já verificou e club inativo (ou erro): silencioso
  if (phone && hasChecked && !clubAtivo) return null;

  // Sem phone: prompt compacto de identificação
  return <PhonePrompt setPhone={setPhone} />;
}
