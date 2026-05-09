import { useEffect, useState } from 'react';
import type { AdminSession, ClubVipConfig, ClubVipNivel, ClubVipSaldo, ClubVipResgate } from '@/types/admin';
import { buscarClubVipDashboard, configurarClubVip } from '@/services/api';
import { Toggle } from '@/components/ui/Toggle';

interface PromocoesProps {
  session: AdminSession;
}

// ─── Shared styles ─────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
};

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: 5,
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Sk({ h = 14, w = '100%' }: { h?: number; w?: number | string }) {
  return (
    <div
      className="animate-pulse rounded-lg"
      style={{ height: h, width: w, backgroundColor: 'var(--color-surface-2)' }}
    />
  );
}

function PromocoesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 space-y-4" style={card}>
        <Sk h={16} w={160} />
        <div className="flex items-center justify-between"><Sk h={13} w={120} /><Sk h={24} w={40} /></div>
        <div className="grid grid-cols-2 gap-3"><Sk h={38} /><Sk h={38} /></div>
        <Sk h={36} />
      </div>
      <div className="rounded-2xl p-5 space-y-3" style={card}>
        <Sk h={16} w={140} />
        {[1, 2, 3].map((i) => <Sk key={i} h={48} />)}
        <Sk h={38} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 space-y-3" style={card}><Sk h={16} w={120} />{[1,2,3].map(i=><Sk key={i} h={52}/>)}</div>
        <div className="rounded-2xl p-5 space-y-3" style={card}><Sk h={16} w={120} />{[1,2].map(i=><Sk key={i} h={52}/>)}</div>
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────

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

// ─── Seção 1 — Configuração ────────────────────────────────────────────────

function SecaoConfig({
  config,
  saving,
  onSave,
}: {
  config: ClubVipConfig;
  saving: boolean;
  onSave: (cfg: ClubVipConfig) => void;
}) {
  const [form, setForm] = useState<ClubVipConfig>(config);

  useEffect(() => { setForm(config); }, [config]);

  const set = <K extends keyof ClubVipConfig>(k: K, v: ClubVipConfig[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--color-primary)' }}>
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        <h2 className="text-sm font-700" style={{ color: 'var(--color-text)' }}>Configuracao do Club VIP</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-600" style={{ color: 'var(--color-text)' }}>Club VIP ativo</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Clientes acumulam pontos por compra quando ativo
            </p>
          </div>
          <Toggle
            checked={form.ativo}
            onChange={(v) => set('ativo', v)}
            ariaLabel="Ativar Club VIP"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Valor minimo do pedido (R$)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              disabled={!form.ativo}
              value={form.valor_minimo}
              onChange={(e) => set('valor_minimo', Number(e.target.value))}
              style={{ ...inputStyle, opacity: form.ativo ? 1 : 0.45 }}
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={labelStyle}>Pontos por compra</label>
            <input
              type="number"
              min={1}
              disabled={!form.ativo}
              value={form.pontos_por_compra}
              onChange={(e) => set('pontos_por_compra', Number(e.target.value))}
              style={{ ...inputStyle, opacity: form.ativo ? 1 : 0.45 }}
              placeholder="1"
            />
          </div>
        </div>

        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-700 transition-opacity disabled:opacity-50 hover:opacity-85"
          style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', border: 'none', cursor: 'pointer' }}
        >
          {saving && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar Configuracao'}
        </button>
      </div>
    </div>
  );
}

// ─── Seção 2 — Níveis ──────────────────────────────────────────────────────

function SecaoNiveis({
  niveis,
  onToggle,
  onDelete,
  onAdd,
  addingNivel,
}: {
  niveis: ClubVipNivel[];
  onToggle: (nivel: ClubVipNivel) => void;
  onDelete: (nivel: ClubVipNivel) => void;
  onAdd: (meta_pontos: number, brinde: string) => void;
  addingNivel: boolean;
}) {
  const [novoMeta, setNovoMeta] = useState('');
  const [novoBrinde, setNovoBrinde] = useState('');

  const handleAdd = () => {
    const meta = Number(novoMeta);
    if (!meta || !novoBrinde.trim()) return;
    onAdd(meta, novoBrinde.trim());
    setNovoMeta('');
    setNovoBrinde('');
  };

  const sorted = [...niveis].sort((a, b) => a.meta_pontos - b.meta_pontos);

  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--color-primary)' }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h2 className="text-sm font-700" style={{ color: 'var(--color-text)' }}>Niveis de Brinde</h2>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}
        >
          {niveis.length} {niveis.length === 1 ? 'nivel' : 'niveis'}
        </span>
      </div>

      <div className="p-5 space-y-3">
        {sorted.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            Nenhum nivel cadastrado ainda
          </p>
        ) : (
          sorted.map((nivel) => (
            <div
              key={nivel.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 truncate" style={{ color: 'var(--color-text)' }}>
                  {nivel.brinde}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {nivel.meta_pontos} {nivel.meta_pontos === 1 ? 'ponto' : 'pontos'} necessarios
                </p>
              </div>

              <span
                className="text-[10px] font-700 px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: nivel.ativo ? 'rgb(16 185 129 / 0.12)' : 'rgb(107 114 128 / 0.12)',
                  color: nivel.ativo ? '#10B981' : 'var(--color-text-muted)',
                }}
              >
                {nivel.ativo ? 'Ativo' : 'Inativo'}
              </span>

              <button
                onClick={() => onToggle(nivel)}
                title={nivel.ativo ? 'Desativar nivel' : 'Ativar nivel'}
                className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  {nivel.ativo ? (
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  )}
                </svg>
              </button>

              <button
                onClick={() => onDelete(nivel)}
                title="Excluir nivel"
                className="opacity-30 hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: '#F87171', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}

        {/* Formulário de adição */}
        <div
          className="flex gap-2 pt-2"
          style={{ borderTop: niveis.length > 0 ? '1px solid var(--color-border)' : 'none' }}
        >
          <div style={{ flex: '0 0 100px' }}>
            <input
              type="number"
              min={1}
              value={novoMeta}
              onChange={(e) => setNovoMeta(e.target.value)}
              placeholder="Pontos"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={novoBrinde}
              onChange={(e) => setNovoBrinde(e.target.value)}
              placeholder="Nome do brinde"
              style={inputStyle}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={addingNivel || !novoMeta || !novoBrinde.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-700 transition-opacity disabled:opacity-40 hover:opacity-85 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', border: 'none', cursor: 'pointer' }}
          >
            {addingNivel ? (
              <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            )}
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Seção 3 — Dashboard ───────────────────────────────────────────────────

function SecaoDashboard({ saldos, resgates }: { saldos: ClubVipSaldo[]; resgates: ClubVipResgate[] }) {
  const pendentes = resgates.filter((r) => !r.utilizado);
  const sortedSaldos = [...saldos].sort((a, b) => b.pontos - a.pontos);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Saldos */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--color-primary)' }}>
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <h2 className="text-sm font-700" style={{ color: 'var(--color-text)' }}>Saldo dos Clientes</h2>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}
          >
            {sortedSaldos.length}
          </span>
        </div>

        <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
          {sortedSaldos.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
              Nenhum cliente com pontos ainda
            </p>
          ) : (
            sortedSaldos.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-2)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                  style={{ backgroundColor: 'rgb(245 166 35 / 0.15)', color: 'var(--color-primary)' }}
                >
                  {(s.nome ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-600 truncate" style={{ color: 'var(--color-text)' }}>{s.nome}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {formatPhone(s.phone)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-700" style={{ color: 'var(--color-primary)' }}>{s.pontos} pts</p>
                  {s.total_resgatado > 0 && (
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {s.total_resgatado} resgatado{s.total_resgatado !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resgates pendentes */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: '#EF4444' }}>
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
          <h2 className="text-sm font-700" style={{ color: 'var(--color-text)' }}>Resgates Pendentes</h2>
          {pendentes.length > 0 && (
            <span
              className="ml-auto text-xs font-700 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgb(239 68 68 / 0.12)', color: '#EF4444' }}
            >
              {pendentes.length}
            </span>
          )}
        </div>

        <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
          {pendentes.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
              Nenhum resgate pendente
            </p>
          ) : (
            pendentes.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-2)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-600 truncate" style={{ color: 'var(--color-text)' }}>
                      {r.cliente_nome}
                    </p>
                    <span
                      className="text-[10px] font-700 px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'rgb(239 68 68 / 0.12)', color: '#EF4444' }}
                    >
                      Pendente
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--color-primary)' }}>
                    {r.brinde}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {formatPhone(r.cliente_phone)} · {formatDate(r.criado_em)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function Promocoes({ session }: PromocoesProps) {
  const [dados, setDados] = useState<{
    config: ClubVipConfig;
    niveis: ClubVipNivel[];
    saldos: ClubVipSaldo[];
    resgates: ClubVipResgate[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingNivel, setAddingNivel] = useState(false);

  const load = () => {
    setLoading(true);
    buscarClubVipDashboard(session.merchant_id, session.token)
      .then((res) => {
        if (res.sucesso) {
          setDados({ config: res.config, niveis: res.niveis, saldos: res.saldos, resgates: res.resgates });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [session]);

  const handleSaveConfig = async (cfg: ClubVipConfig) => {
    setSaving(true);
    try {
      await configurarClubVip(session.merchant_id, session.token, 'salvar_config', {
        ativo: cfg.ativo,
        valor_minimo: cfg.valor_minimo,
        pontos_por_compra: cfg.pontos_por_compra,
      });
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNivel = async (nivel: ClubVipNivel) => {
    try {
      await configurarClubVip(session.merchant_id, session.token, 'toggle_nivel', {
        nivel_id: nivel.id,
        ativo: !nivel.ativo,
      });
      load();
    } catch {}
  };

  const handleDeleteNivel = async (nivel: ClubVipNivel) => {
    try {
      await configurarClubVip(session.merchant_id, session.token, 'deletar_nivel', {
        nivel_id: nivel.id,
      });
      load();
    } catch {}
  };

  const handleAddNivel = async (meta_pontos: number, brinde: string) => {
    setAddingNivel(true);
    try {
      await configurarClubVip(session.merchant_id, session.token, 'adicionar_nivel', {
        meta_pontos,
        brinde,
      });
      load();
    } catch {
    } finally {
      setAddingNivel(false);
    }
  };

  if (loading) return <PromocoesSkeleton />;
  if (!dados) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>Promocoes — Club VIP</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Configure niveis de brinde e acompanhe pontos dos clientes
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

      <SecaoConfig config={dados.config} saving={saving} onSave={handleSaveConfig} />

      <SecaoNiveis
        niveis={dados.niveis}
        onToggle={handleToggleNivel}
        onDelete={handleDeleteNivel}
        onAdd={handleAddNivel}
        addingNivel={addingNivel}
      />

      <SecaoDashboard saldos={dados.saldos} resgates={dados.resgates} />
    </div>
  );
}
