import { useEffect, useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { fetchPedidos } from '@/services/api';
import { exportarPedidos } from '@/services/excel';
import { formatCurrency } from '@/utils/formatCurrency';

interface PedidosProps {
  session: AdminSession;
}

interface Pedido {
  id: string;
  canal: string;
  status: string;
  total: string;
  criado_em: string;
  atualizado_em: string;
  cliente_nome: string;
  cliente_phone: string | null;
  forma_pagamento: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    cidade: string;
  };
  itens: {
    nome: string;
    preco: number;
    quantidade: number;
  }[];
}

interface Indicadores {
  total_pedidos: number;
  total_ifood: number;
  total_direto: number;
  valor_total: string;
  valor_ifood: string;
  valor_direto: string;
  ticket_medio: string;
}

// ─── Config maps ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  em_preparo: { label: 'Em Preparo', color: '#F59E0B', bg: 'rgb(245 158 11 / 0.12)' },
  entregue:   { label: 'Entregue',   color: '#10B981', bg: 'rgb(16 185 129 / 0.12)'  },
  cancelado:  { label: 'Cancelado',  color: '#EF4444', bg: 'rgb(239 68 68 / 0.12)'  },
  pendente:   { label: 'Pendente',   color: '#6B7280', bg: 'rgb(107 114 128 / 0.12)' },
};

const CANAL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  DIRETO: { label: 'Direto', color: '#B45309', bg: 'rgb(245 166 35 / 0.15)' },
  IFOOD:  { label: 'iFood',  color: '#EF4444', bg: 'rgb(239 68 68 / 0.12)'  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatEndereco(e: Pedido['endereco']) {
  if (!e) return '—';
  const parts = [e.logradouro, e.numero, e.complemento, e.cidade].filter(Boolean);
  return parts.join(', ') || '—';
}

// ─── Shared styles ─────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  padding: 16,
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Sk({ h = 14, w = '100%' }: { h?: number; w?: number | string }) {
  return <div className="animate-pulse rounded-lg" style={{ height: h, width: w, backgroundColor: 'var(--color-surface-2)' }} />;
}

function PedidosSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><Sk h={20} w={180} /><Sk h={32} w={100} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Sk h={12} w={80} /><Sk h={28} w={60} /><Sk h={12} w={100} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <Sk h={32} />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <Sk h={36} w={36} />
            <div className="flex-1 space-y-1.5"><Sk h={14} w={160} /><Sk h={11} w={100} /></div>
            <Sk h={22} w={60} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Indicator card ────────────────────────────────────────────────────────

function IndCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={card}>
      <p className="text-xs font-600 mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  );
}

// ─── Filter chip ───────────────────────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-lg font-600 transition-all"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface-2)',
        color: active ? '#0D0D0D' : 'var(--color-text-secondary)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function Pedidos({ session }: PedidosProps) {
  const [dados, setDados] = useState<{ indicadores: Indicadores; pedidos: Pedido[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroCanal, setFiltroCanal] = useState<'todos' | 'DIRETO' | 'IFOOD'>('todos');
  const [pedidoAberto, setPedidoAberto] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchPedidos(session.merchant_id, session.token)
      .then((res) => setDados(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [session]);

  if (loading) return <PedidosSkeleton />;
  if (!dados) return null;

  const { indicadores: ind, pedidos } = dados;

  const pedidosFiltrados = pedidos.filter((p) =>
    filtroCanal === 'todos' || p.canal === filtroCanal,
  );

  if (pedidos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>Pedidos</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Nenhum pedido registrado ainda</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Atualizar
          </button>
        </div>
        <div
          className="rounded-2xl p-16 flex flex-col items-center gap-4"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-14 h-14" style={{ color: 'var(--color-text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-600" style={{ color: 'var(--color-text)' }}>Nenhum pedido ainda</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Os pedidos realizados pelo cardapio aparecerao aqui</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>Pedidos</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {ind.total_pedidos} {ind.total_pedidos === 1 ? 'pedido registrado' : 'pedidos registrados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pedidos.length > 0 && (
            <button
              onClick={() => exportarPedidos(pedidos)}
              className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl transition-opacity hover:opacity-70"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-6.707a1 1 0 011.414 0L9 11.586V3a1 1 0 112 0v8.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportar
            </button>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl transition-opacity hover:opacity-70"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Indicator cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div style={card}>
          <p className="text-xs font-600 mb-2" style={{ color: 'var(--color-text-secondary)' }}>Total de Pedidos</p>
          <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>{ind.total_pedidos}</p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Direto: <span className="font-700" style={{ color: 'var(--color-primary)' }}>{ind.total_direto}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              iFood: <span className="font-700" style={{ color: '#EF4444' }}>{ind.total_ifood}</span>
            </span>
          </div>
        </div>

        <div style={card}>
          <p className="text-xs font-600 mb-2" style={{ color: 'var(--color-text-secondary)' }}>Valor Total</p>
          <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>
            {formatCurrency(Number(ind.valor_total))}
          </p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Direto: <span className="font-700" style={{ color: 'var(--color-primary)' }}>{formatCurrency(Number(ind.valor_direto))}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              iFood: <span className="font-700" style={{ color: '#EF4444' }}>{formatCurrency(Number(ind.valor_ifood))}</span>
            </span>
          </div>
        </div>

        <IndCard
          label="Ticket Medio"
          value={formatCurrency(Number(ind.ticket_medio))}
          sub="media por pedido"
        />
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-3 flex flex-wrap gap-2 items-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <Chip active={filtroCanal === 'todos'} onClick={() => setFiltroCanal('todos')}>Todos</Chip>
        <Chip active={filtroCanal === 'DIRETO'} onClick={() => setFiltroCanal('DIRETO')}>Direto</Chip>
        <Chip active={filtroCanal === 'IFOOD'} onClick={() => setFiltroCanal('IFOOD')}>iFood</Chip>
      </div>

      {/* Pedido list */}
      <div className="space-y-2">
        {pedidosFiltrados.length === 0 ? (
          <div
            className="rounded-2xl p-12 flex flex-col items-center gap-3"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 opacity-20" style={{ color: 'var(--color-text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-600" style={{ color: 'var(--color-text)' }}>Nenhum pedido encontrado</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tente ajustar os filtros</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const status = STATUS_CFG[pedido.status] ?? STATUS_CFG.pendente;
            const canal = CANAL_CFG[pedido.canal] ?? { label: pedido.canal, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' };
            const aberto = pedidoAberto === pedido.id;

            return (
              <div
                key={pedido.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setPedidoAberto(aberto ? null : pedido.id)}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 shrink-0"
                    style={{ backgroundColor: 'rgb(245 166 35 / 0.15)', color: 'var(--color-primary)' }}
                  >
                    {pedido.cliente_nome.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 truncate" style={{ color: 'var(--color-text)' }}>{pedido.cliente_nome}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{formatDate(pedido.criado_em)}</p>
                  </div>

                  {/* Canal badge */}
                  <span
                    className="text-xs font-600 px-2 py-1 rounded-lg shrink-0 hidden sm:block"
                    style={{ backgroundColor: canal.bg, color: canal.color }}
                  >
                    {canal.label}
                  </span>

                  {/* Forma de pagamento */}
                  <span className="text-xs hidden md:block shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {pedido.forma_pagamento}
                  </span>

                  {/* Total */}
                  <span className="text-xs font-700 shrink-0" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(Number(pedido.total))}
                  </span>

                  {/* Status badge */}
                  <span
                    className="text-xs font-600 px-2 py-1 rounded-lg shrink-0"
                    style={{ backgroundColor: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>

                  {/* Chevron */}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Expanded details */}
                {aberto && (
                  <div
                    className="px-4 pb-4 pt-3 space-y-4"
                    style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
                  >
                    {/* Endereco */}
                    <div>
                      <p className="text-[10px] font-600 uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>Endereco</p>
                      <p className="text-xs font-500" style={{ color: 'var(--color-text)' }}>{formatEndereco(pedido.endereco)}</p>
                    </div>

                    {/* Itens */}
                    <div>
                      <p className="text-[10px] font-600 uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Itens do Pedido</p>
                      {pedido.itens.length === 0 ? (
                        <p className="text-xs py-2" style={{ color: 'var(--color-text-muted)' }}>Sem itens registrados neste pedido.</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ color: 'var(--color-text-secondary)' }}>
                              <th className="text-left font-600 pb-1.5" style={{ width: '50%' }}>Item</th>
                              <th className="text-center font-600 pb-1.5">Qtd</th>
                              <th className="text-right font-600 pb-1.5">Preco</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedido.itens.map((item, idx) => (
                              <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                                <td className="py-1.5 font-500" style={{ color: 'var(--color-text)' }}>{item.nome}</td>
                                <td className="py-1.5 text-center font-600" style={{ color: 'var(--color-text-secondary)' }}>{item.quantidade}</td>
                                <td className="py-1.5 text-right font-700" style={{ color: 'var(--color-primary)' }}>
                                  {formatCurrency(item.preco * item.quantidade)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {pedidosFiltrados.length > 0 && (
        <p className="text-xs text-center pb-2" style={{ color: 'var(--color-text-muted)' }}>
          {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'} encontrado{pedidosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
