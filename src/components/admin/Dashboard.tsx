import { useEffect, useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { fetchDashboard } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';

interface DashboardProps {
  session: AdminSession;
  nomeLoja: string;
  slug: string;
}

interface Indicadores {
  total_clientes: number;
  clientes_capturados: number;
  total_pedidos: number;
  pedidos_diretos: number;
  ltv_medio: number;
  total_followups: number;
  total_itens: number;
  itens_ativos: number;
}

const card: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
};

function SkeletonBlock({ h = 24, w = '100%' }: { h?: number; w?: string | number }) {
  return (
    <div
      className="animate-pulse rounded-xl"
      style={{ height: h, width: w, backgroundColor: 'var(--color-surface-2)' }}
    />
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={card}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function BarChart({ pedidosIfood, pedidosDiretos }: { pedidosIfood: number; pedidosDiretos: number }) {
  const total = pedidosIfood + pedidosDiretos;
  const maxVal = Math.max(pedidosIfood, pedidosDiretos, 1);
  const bars = [
    { label: 'Marketplace', value: pedidosIfood, color: '#60A5FA' },
    { label: 'Direto', value: pedidosDiretos, color: '#F5A623' },
  ];

  const pct = total > 0 ? Math.round((pedidosDiretos / total) * 100) : 0;

  return (
    <div className="rounded-2xl p-4 space-y-4" style={card}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>
          Pedidos — Canal de Origem
        </h3>
        <span
          className="text-xs font-700 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgb(245 166 35 / 0.12)', color: 'var(--color-primary)' }}
        >
          {pct}% direto
        </span>
      </div>

      <div className="flex items-end gap-4 h-20">
        {bars.map((b) => {
          const height = maxVal > 0 ? Math.max(8, Math.round((b.value / maxVal) * 72)) : 8;
          return (
            <div key={b.label} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-xs font-700" style={{ color: 'var(--color-text)' }}>
                {b.value}
              </span>
              <div className="w-full rounded-t-lg" style={{ height, backgroundColor: b.color }} />
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {b.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>Marketplace</span>
          <span>Direto</span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              width: total > 0 ? `${pct}%` : '0%',
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ProgressCard({
  title,
  primary,
  primaryLabel,
  secondary,
  secondaryLabel,
  color,
}: {
  title: string;
  primary: number;
  primaryLabel: string;
  secondary: number;
  secondaryLabel: string;
  color: string;
}) {
  const pct = secondary > 0 ? (primary / secondary) * 100 : 0;
  return (
    <div className="rounded-2xl p-4 space-y-3" style={card}>
      <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </h3>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>
            {primary}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {primaryLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-600" style={{ color: 'var(--color-text-secondary)' }}>
            {secondary}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {secondaryLabel}
          </p>
        </div>
      </div>
      <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function LinkCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://sequiserpedir.vercel.app/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-4 space-y-3" style={card}>
      <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>
        Link do Cardápio
      </h3>

      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
        <span className="text-xs truncate flex-1" style={{ color: 'var(--color-text)' }}>
          {url}
        </span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-600 transition-all"
          style={{
            backgroundColor: copied ? '#10B981' : 'var(--color-primary)',
            color: '#0D0D0D',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-600 hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
        Abrir cardápio
      </a>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <SkeletonBlock h={20} w={200} />
        <SkeletonBlock h={14} w={160} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={card}>
            <div className="flex justify-between items-center">
              <SkeletonBlock h={12} w={80} />
              <SkeletonBlock h={32} w={32} />
            </div>
            <SkeletonBlock h={28} w={60} />
            <SkeletonBlock h={12} w={100} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={card}>
            <SkeletonBlock h={12} w={120} />
            <SkeletonBlock h={36} />
            <SkeletonBlock h={6} />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function Dashboard({ session, nomeLoja, slug }: DashboardProps) {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboard(session.merchant_id, session.token)
      .then(setDados)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <DashboardSkeleton />;
  if (!dados) return null;

  const taxaCaptura = dados.total_clientes > 0
    ? Math.round((dados.clientes_capturados / dados.total_clientes) * 100)
    : 0;

  const taxaDireta = dados.total_pedidos > 0
    ? Math.round((dados.pedidos_diretos / dados.total_pedidos) * 100)
    : 0;

  const pedidosIfood = dados.total_pedidos - dados.pedidos_diretos;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>
          Olá, {nomeLoja} 👋
        </h2>
        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--color-text-muted)' }}>
          {formatDate()}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Clientes Capturados"
          value={dados.clientes_capturados}
          sub={`${taxaCaptura}% de conversão`}
          accent="#F5A623"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          }
        />
        <MetricCard
          label="Pedidos Diretos"
          value={dados.pedidos_diretos}
          sub={`${taxaDireta}% do total`}
          accent="#10B981"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
            </svg>
          }
        />
        <MetricCard
          label="LTV Médio"
          value={formatCurrency(Number(dados.ltv_medio))}
          sub="por cliente capturado"
          accent="#60A5FA"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          }
        />
        <MetricCard
          label="Follow-ups Enviados"
          value={dados.total_followups}
          sub="reativações automáticas"
          accent="#C084FC"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          }
        />
      </div>

      {/* Segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BarChart pedidosIfood={pedidosIfood} pedidosDiretos={dados.pedidos_diretos} />

        <ProgressCard
          title="Cardápio"
          primary={dados.itens_ativos}
          primaryLabel="itens disponíveis"
          secondary={dados.total_itens}
          secondaryLabel="total de itens"
          color="var(--color-primary)"
        />

        <ProgressCard
          title="Base de Clientes"
          primary={dados.clientes_capturados}
          primaryLabel="na carteira própria"
          secondary={dados.total_clientes}
          secondaryLabel="clientes identificados"
          color="#10B981"
        />
      </div>

      {/* Link */}
      <LinkCard slug={slug} />
    </div>
  );
}
