import { useEffect, useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { fetchCarteira } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';

interface CarteiraProps {
  session: AdminSession;
}

interface Cliente {
  id: string;
  nome: string;
  phone: string;
  endereco: string;
  cep: string;
  segmento: string;
  origem: string;
  total_pedidos: number;
  ultimo_pedido: string;
  gap_medio: number | null;
  ltv: string;
  status_cliente: string;
  dias_sem_pedido: number;
  criado_em: string;
}

interface Indicadores {
  total_carteira: number;
  total_qr_code: number;
  total_espontaneo: number;
  oportunidades_marketplace: number;
  clientes_ativos: number;
  clientes_em_risco: number;
  clientes_inativos: number;
  ltv_medio: string;
  ltv_total: string;
  ltv_mes_atual: string;
  gap_medio_carteira: number;
  total_convertidos: number;
  total_tentativas: number;
  taxa_conversao: number;
}

// ─── Config maps ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ativo:    { label: 'Ativo',    color: '#10B981', bg: 'rgb(16 185 129 / 0.12)' },
  em_risco: { label: 'Em Risco', color: '#F59E0B', bg: 'rgb(245 158 11 / 0.12)' },
  inativo:  { label: 'Inativo',  color: '#EF4444', bg: 'rgb(239 68 68 / 0.12)'  },
  novo:     { label: 'Novo',     color: '#60A5FA', bg: 'rgb(96 165 250 / 0.12)' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatPhone(phone: string) {
  if (!phone) return '—';
  const p = phone.replace(/\D/g, '');
  if (p.length === 13) return `+${p.slice(0, 2)} (${p.slice(2, 4)}) ${p.slice(4, 9)}-${p.slice(9)}`;
  return phone;
}

// ─── Shared styles ─────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  padding: 16,
};

// ─── Icons ─────────────────────────────────────────────────────────────────

function IconQR() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 11a1 1 0 10-2 0v4a1 1 0 102 0v-4zM14 9a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1h-1V10a1 1 0 00-1-1zM14 15h2v1h-2v-1z" clipRule="evenodd" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
    </svg>
  );
}

function OrigemIcon({ origem }: { origem: string }) {
  if (origem === 'qr_code') return <IconQR />;
  if (origem === 'espontaneo') return <IconChat />;
  return null;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Sk({ h = 14, w = '100%' }: { h?: number; w?: number | string }) {
  return <div className="animate-pulse rounded-lg" style={{ height: h, width: w, backgroundColor: 'var(--color-surface-2)' }} />;
}

function CarteiraSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><Sk h={20} w={200} /><Sk h={32} w={100} /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Sk h={12} w={80} /><Sk h={28} w={60} /><Sk h={12} w={100} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-3 space-y-2" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <Sk h={36} />
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3"><Sk h={36} w={36} /><div className="flex-1 space-y-1.5"><Sk h={14} w={160} /><Sk h={11} w={100} /></div><Sk h={22} w={60} /></div>
        </div>
      ))}
    </div>
  );
}

// ─── Indicator card ────────────────────────────────────────────────────────

function IndCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={card}>
      <p className="text-xs font-600 mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <p className="text-2xl font-700 leading-none" style={{ color: accent ?? 'var(--color-text)' }}>{value}</p>
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

export function Carteira({ session }: CarteiraProps) {
  const [dados, setDados] = useState<{ indicadores: Indicadores; clientes: Cliente[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroOrigem, setFiltroOrigem] = useState<'todos' | 'qr_code' | 'espontaneo'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'em_risco' | 'inativo' | 'novo'>('todos');
  const [busca, setBusca] = useState('');
  const [clienteAberto, setClienteAberto] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchCarteira(session.merchant_id, session.token)
      .then((res) => setDados(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [session]);

  if (loading) return <CarteiraSkeleton />;
  if (!dados) return null;

  const { indicadores: ind, clientes } = dados;

  const clientesFiltrados = clientes.filter((c) => {
    const matchOrigem = filtroOrigem === 'todos' || c.origem === filtroOrigem;
    const matchStatus = filtroStatus === 'todos' || c.status_cliente === filtroStatus;
    const matchBusca = !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.phone.includes(busca);
    return matchOrigem && matchStatus && matchBusca;
  });

  const totalCarteira = ind.clientes_ativos + ind.clientes_em_risco + ind.clientes_inativos;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>Carteira de Clientes</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {ind.total_carteira} {ind.total_carteira === 1 ? 'cliente capturado' : 'clientes capturados'}
          </p>
        </div>
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

      {/* Indicator cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div style={card}>
          <p className="text-xs font-600 mb-2" style={{ color: 'var(--color-text-secondary)' }}>Total na Carteira</p>
          <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>{ind.total_carteira}</p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <IconQR /> {ind.total_qr_code} QR
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <IconChat /> {ind.total_espontaneo} Esp.
            </span>
          </div>
        </div>

        <div style={card}>
          <p className="text-xs font-600 mb-3" style={{ color: 'var(--color-text-secondary)' }}>Saude da Carteira</p>
          <div className="space-y-2">
            {[
              { label: 'Ativos', value: ind.clientes_ativos, color: '#10B981' },
              { label: 'Em Risco', value: ind.clientes_em_risco, color: '#F59E0B' },
              { label: 'Inativos', value: ind.clientes_inativos, color: '#EF4444' },
            ].map((b) => {
              const pct = totalCarteira > 0 ? (b.value / totalCarteira) * 100 : 0;
              return (
                <div key={b.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.label}
                    </span>
                    <span className="text-xs font-700" style={{ color: 'var(--color-text)' }}>{b.value}</span>
                  </div>
                  <div className="w-full h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: b.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <IndCard
          label="LTV do Mês"
          value={formatCurrency(Number(ind.ltv_mes_atual))}
          sub={`Total acumulado: ${formatCurrency(Number(ind.ltv_total))}`}
        />

        <IndCard
          label="Oportunidades iFood"
          value={ind.oportunidades_marketplace}
          sub="clientes nao capturados"
          accent="var(--color-primary)"
        />
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-3 flex flex-wrap gap-2 items-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs rounded-xl pl-9 pr-3 py-2 outline-none"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        <div className="flex gap-1">
          <Chip active={filtroOrigem === 'todos'} onClick={() => setFiltroOrigem('todos')}>Todos</Chip>
          <Chip active={filtroOrigem === 'qr_code'} onClick={() => setFiltroOrigem('qr_code')}>QR Code</Chip>
          <Chip active={filtroOrigem === 'espontaneo'} onClick={() => setFiltroOrigem('espontaneo')}>Espontaneo</Chip>
        </div>

        <div className="flex gap-1">
          <Chip active={filtroStatus === 'todos'} onClick={() => setFiltroStatus('todos')}>Todos</Chip>
          {(['ativo', 'em_risco', 'inativo'] as const).map((s) => (
            <Chip key={s} active={filtroStatus === s} onClick={() => setFiltroStatus(s)}>
              {STATUS_CFG[s].label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div className="space-y-2">
        {clientesFiltrados.length === 0 ? (
          <div
            className="rounded-2xl p-12 flex flex-col items-center gap-3"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 opacity-20" style={{ color: 'var(--color-text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-600" style={{ color: 'var(--color-text)' }}>Nenhum cliente encontrado</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tente ajustar os filtros</p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => {
            const status = STATUS_CFG[cliente.status_cliente] ?? STATUS_CFG.novo;
            const origemLabel = cliente.origem === 'qr_code' ? 'QR Code' : cliente.origem === 'espontaneo' ? 'Espontaneo' : cliente.origem;
            const aberto = clienteAberto === cliente.id;

            return (
              <div
                key={cliente.id}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setClienteAberto(aberto ? null : cliente.id)}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0"
                    style={{ backgroundColor: 'rgb(245 166 35 / 0.15)', color: 'var(--color-primary)' }}
                  >
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + phone */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 truncate" style={{ color: 'var(--color-text)' }}>{cliente.nome}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{formatPhone(cliente.phone)}</p>
                  </div>

                  {/* Origin */}
                  <span className="text-xs hidden sm:flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <OrigemIcon origem={cliente.origem} />
                    {origemLabel}
                  </span>

                  {/* LTV */}
                  <span className="text-xs hidden md:block" style={{ color: 'var(--color-text-secondary)' }}>
                    LTV: <span className="font-700" style={{ color: 'var(--color-primary)' }}>{formatCurrency(Number(cliente.ltv))}</span>
                  </span>

                  {/* Status badge */}
                  <span
                    className="text-xs font-600 px-2 py-1 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>

                  {/* Chevron */}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Expanded details */}
                {aberto && (
                  <div
                    className="px-4 pb-4 pt-3 grid grid-cols-2 md:grid-cols-3 gap-4"
                    style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
                  >
                    {[
                      { label: 'Endereco', value: cliente.endereco || '—' },
                      { label: 'Segmento', value: cliente.segmento || '—' },
                      { label: 'Total Pedidos', value: String(cliente.total_pedidos) },
                      { label: 'Ultimo Pedido', value: formatDate(cliente.ultimo_pedido) },
                      { label: 'Gap Medio', value: cliente.gap_medio ? `${cliente.gap_medio} dias` : '—' },
                      { label: 'Cliente desde', value: formatDate(cliente.criado_em) },
                    ].map((d) => (
                      <div key={d.label}>
                        <p className="text-[10px] font-600 uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{d.label}</p>
                        <p className="text-xs font-500" style={{ color: 'var(--color-text)' }}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {clientesFiltrados.length > 0 && (
        <p className="text-xs text-center pb-2" style={{ color: 'var(--color-text-muted)' }}>
          {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
