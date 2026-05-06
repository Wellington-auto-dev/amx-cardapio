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
  const [draft, setDraft] = useState('');

  // Sem phone: capturar telefone
  if (!phone) {
    return (
      <div style={{ border: '1px solid #444', borderRadius: 16, padding: '12px 16px', marginBottom: 8 }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14 }}>Club VIP</p>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#aaa' }}>
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
            style={{ flex: 1, borderRadius: 10, padding: '8px 12px', fontSize: 13, border: '1px solid #555', background: '#222', color: '#fff', outline: 'none' }}
          />
          <button
            onClick={() => {
              const digits = draft.replace(/\D/g, '');
              if (digits.length >= 10) setPhone(digits);
            }}
            disabled={draft.replace(/\D/g, '').length < 10}
            style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, background: '#f5a623', color: '#0d0d0d', border: 'none', cursor: 'pointer', opacity: draft.replace(/\D/g, '').length < 10 ? 0.4 : 1 }}
          >
            Ver pontos
          </button>
        </div>
      </div>
    );
  }

  // Com phone, aguardando resposta da API
  if (isLoading || !hasChecked) {
    return (
      <div style={{ border: '1px solid #444', borderRadius: 16, padding: '12px 16px', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>Carregando Club VIP...</p>
      </div>
    );
  }

  // Club inativo para este merchant
  if (!clubAtivo) return null;

  // Club ativo: exibir pontos
  const pct = proximoNivel
    ? Math.min(100, Math.round((pontosAtuais / proximoNivel.meta_pontos) * 100))
    : 100;

  return (
    <div style={{ border: '1px solid #444', borderRadius: 16, padding: '12px 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Club VIP</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'rgba(245,166,35,0.15)', color: '#f5a623', borderRadius: 10, padding: '2px 10px', fontWeight: 700, fontSize: 13 }}>
            {pontosAtuais} {pontosAtuais === 1 ? 'ponto' : 'pontos'}
          </span>
          <button
            onClick={() => setPhone('')}
            title="Trocar telefone"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#777', padding: 2, fontSize: 13 }}
          >
            ✎
          </button>
        </div>
      </div>

      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#aaa' }}>
        Você ganha{' '}
        <span style={{ color: '#f5a623', fontWeight: 700 }}>+{pontosPorCompra} {pontosPorCompra === 1 ? 'ponto' : 'pontos'}</span>{' '}
        ao finalizar este pedido
      </p>

      {proximoNivel ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 4 }}>
            <span>Próximo: <strong style={{ color: '#fff' }}>{proximoNivel.brinde}</strong></span>
            <span>
              {proximoNivel.faltam != null
                ? `faltam ${proximoNivel.faltam} pts`
                : `${pontosAtuais}/${proximoNivel.meta_pontos} pts`}
            </span>
          </div>
          <div style={{ background: '#333', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, background: '#f5a623', height: 6, borderRadius: 99, transition: 'width 0.7s' }} />
          </div>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: '#10b981', fontWeight: 700 }}>
          Parabéns! Você atingiu todos os níveis do Club VIP.
        </p>
      )}
    </div>
  );
}
