import { useState } from 'react';
import { registrarIntencaoClubVip } from '@/services/api';

interface ProximoNivel {
  meta_pontos: number;
  brinde: string;
  faltam?: number;
}

interface NivelResgatavel {
  id: string;
  meta_pontos: number;
  brinde: string;
}

interface ClubVipBannerProps {
  phone: string | null;
  setPhone: (phone: string) => void;
  merchantId: string;
  clubAtivo: boolean;
  pontosAtuais: number;
  pontosPorCompra: number;
  proximoNivel: ProximoNivel | null;
  isLoading: boolean;
  hasChecked: boolean;
  resgateDisponivel: boolean;
  nivelResgatavel: NivelResgatavel | null;
  nivelMaximoAtingido: boolean;
  resgateEscolhido: string | null;
  setResgateEscolhido: (id: string | null) => void;
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export function ClubVipBanner({
  phone,
  setPhone,
  merchantId,
  clubAtivo,
  pontosAtuais,
  pontosPorCompra,
  proximoNivel,
  isLoading,
  hasChecked,
  resgateDisponivel,
  nivelResgatavel,
  nivelMaximoAtingido,
  resgateEscolhido,
  setResgateEscolhido,
  addToast,
}: ClubVipBannerProps) {
  const [draft, setDraft] = useState('');

  const resgateAtivo = resgateEscolhido !== null;

  const handleResgatar = async () => {
    if (!nivelResgatavel || resgateAtivo || !phone) return;
    setResgateEscolhido(nivelResgatavel.id);
    addToast('success', `Resgate de ${nivelResgatavel.brinde} selecionado!`);
    try {
      await registrarIntencaoClubVip(phone, merchantId, nivelResgatavel.id, 'resgatar');
    } catch {
      // silent — fluxo do cliente nao e bloqueado
    }
  };

  const handleAcumular = async () => {
    if (!phone) return;
    setResgateEscolhido(null);
    addToast('success', 'Voce continuara acumulando pontos');
    try {
      await registrarIntencaoClubVip(phone, merchantId, null, 'acumular');
    } catch {
      // silent
    }
  };

  if (!phone) {
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 16, padding: '12px 16px', marginBottom: 8, backgroundColor: 'var(--color-surface)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>Club VIP</p>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--color-text-muted)' }}>
          Informe seu WhatsApp para ver seus pontos
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="tel"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const digits = draft.replace(/\D/g, '');
                if (digits.length >= 10) setPhone(digits);
              }
            }}
            placeholder="(11) 99999-9999"
            style={{ flex: 1, borderRadius: 10, padding: '8px 12px', fontSize: 13, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text)', outline: 'none' }}
          />
          <button
            onClick={() => {
              const digits = draft.replace(/\D/g, '');
              if (digits.length >= 10) setPhone(digits);
            }}
            disabled={draft.replace(/\D/g, '').length < 10}
            style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, background: 'var(--color-primary)', color: '#0d0d0d', border: 'none', cursor: 'pointer', opacity: draft.replace(/\D/g, '').length < 10 ? 0.4 : 1 }}
          >
            Ver pontos
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !hasChecked) {
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 16, padding: '12px 16px', marginBottom: 8, backgroundColor: 'var(--color-surface)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>Carregando Club VIP...</p>
      </div>
    );
  }

  if (!clubAtivo) return null;

  const pct = proximoNivel
    ? Math.min(100, Math.round((pontosAtuais / proximoNivel.meta_pontos) * 100))
    : 100;

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 16, padding: '12px 16px', marginBottom: 8, backgroundColor: 'var(--color-surface)' }}>

      {/* Header: Club VIP + pontos + trocar telefone */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>Club VIP</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'rgb(245 166 35 / 0.15)', color: 'var(--color-primary)', borderRadius: 10, padding: '2px 10px', fontWeight: 700, fontSize: 13 }}>
            {pontosAtuais} {pontosAtuais === 1 ? 'ponto' : 'pontos'}
          </span>
          <button
            onClick={() => setPhone('')}
            title="Trocar telefone"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, fontSize: 13 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      </div>

      <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--color-text-muted)' }}>
        Voce ganha{' '}
        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>+{pontosPorCompra} {pontosPorCompra === 1 ? 'ponto' : 'pontos'}</span>{' '}
        ao finalizar este pedido
      </p>

      {/* Estado 3: nivel maximo atingido */}
      {nivelMaximoAtingido && nivelResgatavel && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
            Voce atingiu o nivel maximo!
          </p>
          <div style={{ border: '1px solid rgb(245 166 35 / 0.4)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, backgroundColor: 'rgb(245 166 35 / 0.07)' }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Brinde disponivel
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
              {nivelResgatavel.brinde}
            </p>
          </div>
          <button
            onClick={handleResgatar}
            style={{
              width: '100%',
              borderRadius: 10,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: resgateAtivo ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: resgateAtivo ? 'rgb(245 166 35 / 0.25)' : 'var(--color-primary)',
              color: resgateAtivo ? 'var(--color-primary)' : '#0d0d0d',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {resgateAtivo ? (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resgate selecionado
              </>
            ) : (
              'Resgatar agora'
            )}
          </button>
        </>
      )}

      {/* Estado 2: resgate disponivel, nao e nivel maximo */}
      {resgateDisponivel && !nivelMaximoAtingido && nivelResgatavel && (
        <>
          <div style={{ border: '1px solid rgb(245 166 35 / 0.4)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, backgroundColor: 'rgb(245 166 35 / 0.07)' }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Brinde disponivel
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
              {nivelResgatavel.brinde}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={handleResgatar}
              style={{
                flex: 1,
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: resgateAtivo ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: resgateAtivo ? 'rgb(245 166 35 / 0.25)' : 'var(--color-primary)',
                color: resgateAtivo ? 'var(--color-primary)' : '#0d0d0d',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {resgateAtivo ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15 }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Resgate selecionado
                </>
              ) : (
                'Resgatar agora'
              )}
            </button>
            <button
              onClick={handleAcumular}
              style={{
                flex: 1,
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text-secondary)',
                transition: 'background 0.2s',
                opacity: 1,
              }}
            >
              Continuar acumulando
            </button>
          </div>
        </>
      )}

      {/* Estado 1: sem resgate disponivel — barra de progresso */}
      {!resgateDisponivel && !nivelMaximoAtingido && proximoNivel && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            <span>Proximo: <strong style={{ color: 'var(--color-text)' }}>{proximoNivel.brinde}</strong></span>
            <span>
              {proximoNivel.faltam != null
                ? `faltam ${proximoNivel.faltam} pts`
                : `${pontosAtuais}/${proximoNivel.meta_pontos} pts`}
            </span>
          </div>
          <div style={{ background: 'var(--color-surface-2)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, background: 'var(--color-primary)', height: 6, borderRadius: 99, transition: 'width 0.7s' }} />
          </div>
        </>
      )}

      {/* Proximo nivel abaixo dos botoes (estado 2) */}
      {resgateDisponivel && !nivelMaximoAtingido && proximoNivel && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            <span>Proximo: <strong style={{ color: 'var(--color-text)' }}>{proximoNivel.brinde}</strong></span>
            <span>
              {proximoNivel.faltam != null
                ? `faltam ${proximoNivel.faltam} pts`
                : `${pontosAtuais}/${proximoNivel.meta_pontos} pts`}
            </span>
          </div>
          <div style={{ background: 'var(--color-surface-2)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, background: 'var(--color-primary)', height: 6, borderRadius: 99, transition: 'width 0.7s' }} />
          </div>
        </>
      )}

      {/* Fallback: todos os niveis concluidos (sem resgate disponivel e sem proximo nivel) */}
      {!resgateDisponivel && !nivelMaximoAtingido && !proximoNivel && (
        <p style={{ margin: 0, fontSize: 12, color: '#10b981', fontWeight: 700 }}>
          Parabens! Voce atingiu todos os niveis do Club VIP.
        </p>
      )}
    </div>
  );
}
