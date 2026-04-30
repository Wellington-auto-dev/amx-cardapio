import { useEffect, useRef, useState } from 'react';
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

interface EvolucaoPoint {
  data: string;
  qr_code: number;
  espontaneo: number;
  total: number;
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

function smoothLine(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const mx = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${mx} ${p0.y.toFixed(1)} ${mx} ${p1.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2"><Sk h={20} w={220} /><Sk h={13} w={160} /></div>
        <div className="flex gap-2"><Sk h={30} w={64} /><Sk h={30} w={74} /><Sk h={30} w={74} /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-6 space-y-4" style={card}>
            <div className="flex justify-between items-start"><Sk h={12} w={90} /><Sk h={32} w={32} /></div>
            <Sk h={34} w={80} /><Sk h={12} w={110} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5 rounded-2xl p-6 space-y-4" style={card}>
          <Sk h={12} w={160} />
          <div className="flex justify-center"><Sk h={160} w={160} /></div>
          <div className="space-y-3"><Sk h={40} /><Sk h={40} /><Sk h={40} /></div>
        </div>
        <div className="col-span-12 md:col-span-7 rounded-2xl p-6 space-y-6" style={card}>
          <Sk h={12} w={140} />
          {[1, 2, 3].map((i) => <div key={i} className="space-y-2"><Sk h={12} /><Sk h={10} /></div>)}
        </div>
      </div>
      <div className="rounded-2xl p-6 space-y-4" style={card}><Sk h={12} w={240} /><Sk h={200} /></div>
      <div className="rounded-2xl p-6 space-y-4" style={card}><Sk h={12} w={120} /><Sk h={120} /></div>
      <div className="rounded-2xl p-6 space-y-3" style={card}><Sk h={12} w={120} /><Sk h={40} /></div>
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
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={card}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1e` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-700 leading-none" style={{ color: 'var(--color-text)' }}>{value}</p>
        {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Donut chart ───────────────────────────────────────────────────────────

function DonutChart({ qr, espontaneo, marketplace }: { qr: number; espontaneo: number; marketplace: number }) {
  const [tip, setTip] = useState<{ x: number; y: number; label: string; value: number; pct: number } | null>(null);

  const cx = 100; const cy = 100; const ro = 70; const ri = 48;

  const raw = [
    { label: 'QR Code',     value: qr,          color: '#F5A623' },
    { label: 'Espontâneo',  value: espontaneo,  color: '#10B981' },
    { label: 'Marketplace', value: marketplace, color: '#6B7280' },
  ];
  const total = raw.reduce((s, d) => s + d.value, 0);

  const segments: { label: string; value: number; color: string; start: number; end: number; pct: number }[] = [];
  let angle = 0;
  raw.forEach((d, i) => {
    if (d.value <= 0) return;
    const sweep = i === raw.length - 1 ? 360 - angle : (d.value / Math.max(total, 1)) * 360;
    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
    segments.push({ ...d, start: angle, end: angle + sweep, pct });
    angle += sweep;
  });

  return (
    <div className="rounded-2xl p-6" style={card} onMouseLeave={() => setTip(null)}>
      <h3 className="text-xs font-600 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Distribuição da Carteira
      </h3>

      {/* Column layout: SVG centered, legend below — prevents text from being clipped */}
      <div className="flex flex-col items-center gap-5">
        <svg
          viewBox="0 0 200 200"
          className="w-40 h-40 flex-shrink-0"
          onMouseLeave={() => setTip(null)}
        >
          {/* Transparent catch-all clears tooltip when over empty areas */}
          <rect
            x={0} y={0} width={200} height={200} fill="transparent"
            onMouseMove={() => setTip(null)}
          />
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={(ro + ri) / 2} fill="none" stroke="var(--color-border)" strokeWidth={ro - ri} />
          ) : (
            segments.map((s) => (
              <path
                key={s.label}
                d={donutPath(cx, cy, ro, ri, s.start, s.end)}
                fill={s.color}
                style={{ cursor: 'pointer' }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  setTip({ x: e.clientX, y: e.clientY, label: s.label, value: s.value, pct: s.pct });
                }}
              />
            ))
          )}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--color-text)">{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">clientes</text>
        </svg>

        {/* Legend — full card width avoids clipping */}
        <div className="w-full space-y-4">
          {raw.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-500" style={{ color: 'var(--color-text-secondary)' }}>{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-sm font-700" style={{ color: 'var(--color-text)' }}>{d.value}</span>
                    <span
                      className="text-[10px] tabular-nums text-right"
                      style={{ color: 'var(--color-text-muted)', minWidth: 28 }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {tip && (
        <div
          style={{
            position: 'fixed',
            left: tip.x + 14,
            top: tip.y - 52,
            zIndex: 50,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '8px 12px',
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgb(0 0 0 / 0.45)',
          }}
        >
          <p className="text-xs font-700" style={{ color: 'var(--color-text)' }}>{tip.label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {tip.value} clientes · {tip.pct}%
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Health card ───────────────────────────────────────────────────────────

function HealthCard({ ativos, emRisco, inativos }: { ativos: number; emRisco: number; inativos: number }) {
  const total = ativos + emRisco + inativos;
  const bars = [
    { label: 'Ativos',   value: ativos,   color: '#10B981' },
    { label: 'Em Risco', value: emRisco,  color: '#F59E0B' },
    { label: 'Inativos', value: inativos, color: '#EF4444' },
  ];

  return (
    <div className="rounded-2xl p-6 space-y-6" style={card}>
      <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>Saúde da Carteira</h3>
      <div className="space-y-7">
        {bars.map((b) => {
          const pct = total > 0 ? (b.value / total) * 100 : 0;
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-sm font-500" style={{ color: 'var(--color-text-secondary)' }}>{b.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-700" style={{ color: 'var(--color-text)' }}>{b.value}</span>
                  <span
                    className="text-xs font-600 px-2 py-0.5 rounded-full tabular-nums"
                    style={{ backgroundColor: `${b.color}1a`, color: b.color }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct > 0 ? undefined : '4px',
                    backgroundColor: b.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Line chart ────────────────────────────────────────────────────────────

function LineChart({ evolucao }: { evolucao: EvolucaoPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const L = 44; const R = 12; const T = 20; const B = 38;
  const VW = 800; const VH = 220;
  const cW = VW - L - R;
  const cH = VH - T - B;
  const botY = T + cH;
  const n = evolucao.length;

  const allZero = n === 0 || evolucao.every((p) => p.qr_code === 0 && p.espontaneo === 0);

  if (allZero) {
    return (
      <div className="rounded-2xl p-6" style={card}>
        <h3 className="text-xs font-600 mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Evolução de Capturas — Últimos 30 dias
        </h3>
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 opacity-15" style={{ color: 'var(--color-text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-sm font-600" style={{ color: 'var(--color-text-secondary)' }}>Aguardando primeiras capturas</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Os dados aparecerão aqui conforme clientes forem capturados
          </p>
        </div>
      </div>
    );
  }

  const maxV = Math.max(...evolucao.flatMap((p) => [p.qr_code, p.espontaneo]), 1);

  const xOf = (i: number) => L + (n > 1 ? (i / (n - 1)) * cW : cW / 2);
  const yOf = (v: number) => T + cH - (v / maxV) * cH;

  const qrPts  = evolucao.map((p, i) => ({ x: xOf(i), y: yOf(p.qr_code)   }));
  const espPts = evolucao.map((p, i) => ({ x: xOf(i), y: yOf(p.espontaneo) }));

  const qrLine  = smoothLine(qrPts);
  const espLine = smoothLine(espPts);
  const qrArea  = `${qrLine} L ${qrPts[n - 1].x.toFixed(1)},${botY} L ${L},${botY} Z`;
  const espArea = `${espLine} L ${espPts[n - 1].x.toFixed(1)},${botY} L ${L},${botY} Z`;

  const xIdxs = Array.from({ length: 6 }, (_, i) => Math.round((i * (n - 1)) / 5));

  const step = maxV / 4;
  const yTicks = [0, step, step * 2, step * 3, maxV].map(Math.round);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const fmtDateLong = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VW;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const dist = Math.abs(xOf(i) - svgX);
      if (dist < bestD) { bestD = dist; best = i; }
    }
    setHoverIdx(best);
    setTipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="rounded-2xl p-6" style={card} onMouseLeave={() => setHoverIdx(null)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>
          Evolução de Capturas — Últimos 30 dias
        </h3>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: '#F5A623' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>QR Code</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Espontâneo</span>
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ display: 'block', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="lg-qr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F5A623" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0"    />
          </linearGradient>
          <linearGradient id="lg-esp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10B981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((tick, ti) => {
          const y = yOf(tick);
          return (
            <g key={ti}>
              <line x1={L} y1={y} x2={VW - R} y2={y} stroke="var(--color-border)" strokeWidth="0.5" />
              <text x={L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)">{tick}</text>
            </g>
          );
        })}

        {/* X labels */}
        {xIdxs.map((idx) => (
          <text key={idx} x={xOf(idx)} y={botY + 22} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
            {fmtDate(evolucao[idx].data)}
          </text>
        ))}

        {/* Area fills */}
        <path d={qrArea}  fill="url(#lg-qr)"  />
        <path d={espArea} fill="url(#lg-esp)" />

        {/* Lines */}
        <path d={qrLine}  fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={espLine} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover crosshair + dots */}
        {hoverIdx !== null && (
          <g>
            <line
              x1={xOf(hoverIdx)} y1={T}
              x2={xOf(hoverIdx)} y2={botY}
              stroke="var(--color-text-muted)"
              strokeWidth="1"
              strokeDasharray="4 3"
              strokeOpacity="0.5"
            />
            <circle
              cx={qrPts[hoverIdx].x} cy={qrPts[hoverIdx].y} r={4}
              fill="#F5A623" stroke="var(--color-surface)" strokeWidth={2.5}
            />
            <circle
              cx={espPts[hoverIdx].x} cy={espPts[hoverIdx].y} r={4}
              fill="#10B981" stroke="var(--color-surface)" strokeWidth={2.5}
            />
          </g>
        )}
      </svg>

      {hoverIdx !== null && (
        <div
          style={{
            position: 'fixed',
            left: tipPos.x + 14,
            top: tipPos.y - 92,
            zIndex: 50,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '10px 14px',
            pointerEvents: 'none',
            boxShadow: '0 4px 20px rgb(0 0 0 / 0.5)',
            minWidth: 148,
          }}
        >
          <p className="text-xs font-700 mb-2.5" style={{ color: 'var(--color-text)' }}>
            {fmtDateLong(evolucao[hoverIdx].data)}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#F5A623' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                QR Code{' '}
                <span className="font-700" style={{ color: 'var(--color-text)' }}>
                  {evolucao[hoverIdx].qr_code}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Espontâneo{' '}
                <span className="font-700" style={{ color: 'var(--color-text)' }}>
                  {evolucao[hoverIdx].espontaneo}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bar chart ─────────────────────────────────────────────────────────────

function BarChart({ ifood, direto }: { ifood: number; direto: number }) {
  const total = ifood + direto;
  const maxV  = Math.max(ifood, direto, 1);
  const H = 100; const W = 80;

  const bars = [
    { label: 'Marketplace', value: ifood,  color: '#6B7280'              },
    { label: 'Direto',      value: direto, color: 'var(--color-primary)' },
  ];

  const pctDireto = total > 0 ? Math.round((direto / total) * 100) : 0;

  return (
    <div className="rounded-2xl p-6" style={card}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>Canal de Pedidos</h3>
        <span
          className="text-xs font-700 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'rgb(245 166 35 / 0.12)', color: 'var(--color-primary)' }}
        >
          {pctDireto}% direto
        </span>
      </div>

      <div className="flex items-end justify-center gap-10 mb-5" style={{ height: H + 28 }}>
        {bars.map((b) => {
          const barH = maxV > 0 ? Math.max(8, Math.round((b.value / maxV) * H)) : 8;
          return (
            <div key={b.label} className="flex flex-col items-center gap-1.5" style={{ width: W }}>
              <span className="text-lg font-700" style={{ color: 'var(--color-text)' }}>{b.value}</span>
              <div
                className="w-full rounded-t-xl transition-all duration-700"
                style={{ height: barH, backgroundColor: b.color }}
              />
              <span className="text-xs font-500 text-center" style={{ color: 'var(--color-text-muted)' }}>{b.label}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>Marketplace</span>
          <span>Direto</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: total > 0 ? `${pctDireto}%` : '0%', backgroundColor: 'var(--color-primary)' }}
          />
        </div>
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
    <div className="rounded-2xl p-6 space-y-4" style={card}>
      <h3 className="text-xs font-600" style={{ color: 'var(--color-text-secondary)' }}>Link do Cardápio</h3>
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
        <span className="text-xs truncate flex-1" style={{ color: 'var(--color-text)' }}>{url}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-600 transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: copied ? '#10B981' : 'var(--color-primary)',
            color: '#0D0D0D', border: 'none', cursor: 'pointer',
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
        Abrir cardápio
      </a>
    </div>
  );
}

// ─── Period filter ─────────────────────────────────────────────────────────

const PERIODOS = [
  { key: '7d',  label: '7 dias'  },
  { key: '30d', label: '30 dias' },
  { key: '3m',  label: '3 meses' },
] as const;

type Periodo = typeof PERIODOS[number]['key'];

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Main component ────────────────────────────────────────────────────────

export function Dashboard({ session, nomeLoja, slug }: DashboardProps) {
  const [dash, setDash]         = useState<DashData | null>(null);
  const [carteira, setCarteira] = useState<CarteiraInd | null>(null);
  const [evolucao, setEvolucao] = useState<EvolucaoPoint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [periodo, setPeriodo]   = useState<Periodo>('30d');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboard(session.merchant_id, session.token),
      fetchCarteira(session.merchant_id, session.token),
    ])
      .then(([d, c]) => {
        setDash(d);
        setCarteira(c.indicadores);
        setEvolucao(c.evolucao ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <DashboardSkeleton />;
  if (!dash)   return null;

  const taxaCaptura = dash.total_clientes > 0
    ? Math.round((dash.clientes_capturados / dash.total_clientes) * 100) : 0;
  const taxaDireta = dash.total_pedidos > 0
    ? Math.round((dash.pedidos_diretos / dash.total_pedidos) * 100) : 0;
  const pedidosIfood = dash.total_pedidos - dash.pedidos_diretos;

  return (
    <div className="space-y-6">

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
                color:            periodo === p.key ? '#0D0D0D'              : 'var(--color-text-secondary)',
                border: `1px solid ${periodo === p.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Linha 1 — Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          label="Clientes Capturados"
          value={dash.clientes_capturados}
          sub={`${taxaCaptura}% de Conversão`}
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
          label="LTV Médio"
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
          sub="clientes não capturados"
          accent="#C084FC"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Linha 2 — Donut + Health */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5">
          <DonutChart
            qr={carteira?.total_qr_code ?? 0}
            espontaneo={carteira?.total_espontaneo ?? 0}
            marketplace={carteira?.oportunidades_marketplace ?? 0}
          />
        </div>
        <div className="col-span-12 md:col-span-7">
          <HealthCard
            ativos={carteira?.clientes_ativos ?? 0}
            emRisco={carteira?.clientes_em_risco ?? 0}
            inativos={carteira?.clientes_inativos ?? 0}
          />
        </div>
      </div>

      {/* Linha 3 — Line chart */}
      <LineChart evolucao={evolucao} />

      {/* Linha 4 — Bar chart */}
      <BarChart ifood={pedidosIfood} direto={dash.pedidos_diretos} />

      {/* Linha 5 — Link */}
      <LinkCard slug={slug} />
    </div>
  );
}
