import { useEffect, useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { fetchDashboard, fetchCarteira } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';

interface DashboardProps {
  session: AdminSession;
  nomeLoja: string;
  slug: string;
}

interface DashData {
  total_clientes: number;
  clientes_capturados: number;
  total_pedidos: number;
  pedidos_diretos: number;
  ltv_medio: number;
  total_followups: number;
  total_itens: number;
  itens_ativos: number;
}

interface CarteiraInd {
  total_carteira: number;
  total_qr_code: number;
  total_espontaneo: number;
  oportunidades_marketplace: number;
  clientes_ativos: number;
  clientes_em_risco: number;
  clientes_inativos: number;
  ltv_medio: string;
  ltv_total: string;
}

// ─── SVG helpers ───────────────────────────────────────────────────────────

function polar(r: number, deg: number, cx: number, cy: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function donutPath(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number): string {
  const safe = Math.min(a1, a0 + 359.9);
  const large = safe - a0 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  const p1 = polar(ro, a0, cx, cy);
  const p2 = polar(ro, safe, cx, cy);
  const p3 = polar(ri, safe, cx, cy);
  const p4 = polar(ri, a0, cx, cy);
  return `M${f(p1.x)},${f(p1.y)} A${ro},${ro},0,${large},1,${f(p2.x)},${f(p2.y)} L${f(p3.x)},${f(p3.y)} A${ri},${ri},0,${large},0,${f(p4.x)},${f(p4.y)} Z`;
}

// ─── Shared style ──────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Sk({ h = 16, w = '100%' }: { h?: number; w?: number | string }) {
  return (
    <div
      className="animate-pulse rounded-lg"
      style={{ height: h, width: w, backgroundColor: 'var(--color-surface-2)' }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5"><Sk h={20} w={220} /><Sk h={13} w={160} /></div>
        <div className="flex gap-2"><Sk h={28} w={60} /><Sk h={28} w={70} /><Sk h={28} w={70} /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={card}>
            <div className="flex justify-between"><Sk h={12} w={80} /><Sk h={28} w={28} /></div>
            <Sk h={30} w={70} /><Sk h={12} w={100} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="rounded-2xl p-4 space-y-3" style={card}><Sk h={12} w={120} /><Sk h={80} /><Sk h={12} /></div>)}
      </div>
      <div className="rounded-2xl p-4 space-y-3" style={card}><Sk h={12} w={120} /><Sk h={36} /></div>
    </div>
  );
}

// ─── Metric card ───────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon, accent,
}: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2.5" style={card}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Donut chart ───────────────────────────────────────────────────────────

function DonutChart({ qr, espontaneo, marketplace }: { qr: number; espontaneo: number; marketplace: number }) {
  const cx = 60; const cy = 60; const ro = 52; const ri = 34;

  const raw = [
    { label: 'QR Code', value: qr, color: 'var(--color-primary)' },
    { label: 'Espontaneo', value: espontaneo, color: '#10B981' },
    { label: 'Marketplace', value: marketplace, color: '#60A5FA' },
  ];
  const total = raw.reduce((s, d) => s + d.value, 0);

  const segments: { label: string; value: number; color: string; start: number; end: number }[] = [];
  let angle = 0;
  raw.forEach((d, i) => {
    if (d.value <= 0) return;
    const sweep = i === raw.length - 1 ? 360 - angle : (d.value / Math.max(total, 1)) * 360;
    segments.push({ ...d, start: angle, end: angle + sweep });
    angle += sweep;
  });

  return (
    <div className="rounded-2xl p-4" style={card}>
      <h3 className="text-xs font-600 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Distribuicao da Carteira
      </h3>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={(ro + ri) / 2} fill="none" stroke="var(--color-border)" strokeWidth={ro - ri} />
          ) : (
            segments.map((s) => (
              <path key={s.label} d={donutPath(cx, cy, ro, ri, s.start, s.end)} fill={s.color} />
            ))
          )}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-text)">{total}</text>
          <text x={cx} y={cy + 11} textAnchor="middle" fontSize="8" fill="var(--color-text-muted)">clientes</text>
        </svg>
        <div className="flex-1 space-y-3">
          {raw.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{d.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-700" style={{ color: 'var(--color-text)' }}>{d.value}</span>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Bar chart ─────────────────────────────────────────────────────────────

function BarChart({ ifood, direto }: { ifood: number; direto: number }) {
  const total = ifood + direto;
  const maxV = Math.max(ifood, direto, 1);
  const H = 72; const W = 52;

  const bars = [
    { label: 'Marketplace', value: ifood, color: '#60A5FA' },
    { label: 'Direto', value: direto, color: 'var(--color-primary)' },
  ];

  const pctDireto = total > 0 ? Math.round((direto / total) * 100) : 0;

  return (
    <div className="rounded-2xl p-4" style={card}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>Canal de Pedidos</h3>
        <span
          className="text-xs font-700 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgb(245 166 35 / 0.12)', color: 'var(--color-primary)' }}
        >
          {pctDireto}% direto
        </span>
      </div>
      <div className="flex items-end justify-center gap-6 mb-3" style={{ height: H + 24 }}>
        {bars.map((b) => {
          const barH = maxV > 0 ? Math.max(6, Math.round((b.value / maxV) * H)) : 6;
          return (
            <div key={b.label} className="flex flex-col items-center gap-1" style={{ width: W }}>
              <span className="text-sm font-700" style={{ color: 'var(--color-text)' }}>{b.value}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-700"
                style={{ height: barH, backgroundColor: b.color }}
              />
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--color-text-muted)' }}>{b.label}</span>
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
            style={{ width: total > 0 ? `${pctDireto}%` : '0%', backgroundColor: 'var(--color-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Health card ───────────────────────────────────────────────────────────

function HealthCard({ ativos, emRisco, inativos }: { ativos: number; emRisco: number; inativos: number }) {
  const total = ativos + emRisco + inativos;
  const bars = [
    { label: 'Ativos', value: ativos, color: '#10B981' },
    { label: 'Em Risco', value: emRisco, color: '#F59E0B' },
    { label: 'Inativos', value: inativos, color: '#EF4444' },
  ];

  return (
    <div className="rounded-2xl p-4 space-y-4" style={card}>
      <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>Saude da Carteira</h3>
      <div className="space-y-4">
        {bars.map((b) => {
          const pct = total > 0 ? (b.value / total) * 100 : 0;
          return (
            <div key={b.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{b.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-700" style={{ color: 'var(--color-text)' }}>{b.value}</span>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: b.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Link card ─────────────────────────────────────────────────────────────

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
      <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>Link do Cardapio</h3>
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
        <span className="text-xs truncate flex-1" style={{ color: 'var(--color-text)' }}>{url}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-600 transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: copied ? '#10B981' : 'var(--color-primary)',
            color: '#0D0D0D',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copiar
            </>
          )}
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
        Abrir cardapio
      </a>
    </div>
  );
}

// ─── Period filter ─────────────────────────────────────────────────────────

const PERIODOS = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '3m', label: '3 meses' },
] as const;

type Periodo = typeof PERIODOS[number]['key'];

// ─── Date helper ───────────────────────────────────────────────────────────

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Main component ────────────────────────────────────────────────────────

export function Dashboard({ session, nomeLoja, slug }: DashboardProps) {
  const [dash, setDash] = useState<DashData | null>(null);
  const [carteira, setCarteira] = useState<CarteiraInd | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('30d');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboard(session.merchant_id, session.token),
      fetchCarteira(session.merchant_id, session.token),
    ])
      .then(([d, c]) => {
        setDash(d);
        setCarteira(c.indicadores);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <DashboardSkeleton />;
  if (!dash) return null;

  const taxaCaptura = dash.total_clientes > 0
    ? Math.round((dash.clientes_capturados / dash.total_clientes) * 100)
    : 0;
  const taxaDireta = dash.total_pedidos > 0
    ? Math.round((dash.pedidos_diretos / dash.total_pedidos) * 100)
    : 0;
  const pedidosIfood = dash.total_pedidos - dash.pedidos_diretos;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>
            Bem-vindo, {nomeLoja}
          </h2>
          <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate()}
          </p>
        </div>
        <div className="flex gap-1.5">
          {PERIODOS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodo(p.key)}
              className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
              style={{
                backgroundColor: periodo === p.key ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: periodo === p.key ? '#0D0D0D' : 'var(--color-text-secondary)',
                border: `1px solid ${periodo === p.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Clientes Capturados"
          value={dash.clientes_capturados}
          sub={`${taxaCaptura}% de conversao`}
          accent="#F5A623"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          }
        />
        <MetricCard
          label="Pedidos Diretos"
          value={dash.pedidos_diretos}
          sub={`${taxaDireta}% do total`}
          accent="#10B981"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
            </svg>
          }
        />
        <MetricCard
          label="LTV Medio"
          value={formatCurrency(Number(dash.ltv_medio))}
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
          label="Oportunidades iFood"
          value={carteira?.oportunidades_marketplace ?? 0}
          sub="clientes nao capturados"
          accent="#C084FC"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <DonutChart
          qr={carteira?.total_qr_code ?? 0}
          espontaneo={carteira?.total_espontaneo ?? 0}
          marketplace={carteira?.oportunidades_marketplace ?? 0}
        />
        <BarChart ifood={pedidosIfood} direto={dash.pedidos_diretos} />
        <HealthCard
          ativos={carteira?.clientes_ativos ?? 0}
          emRisco={carteira?.clientes_em_risco ?? 0}
          inativos={carteira?.clientes_inativos ?? 0}
        />
      </div>

      {/* Link */}
      <LinkCard slug={slug} />
    </div>
  );
}
