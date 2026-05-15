import { useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { toggleLojaAberta, atualizarMensagemFechado, atualizarHorarios, salvarTaxaEntrega, geocodificarEndereco } from '@/services/api';
import { Toggle } from '@/components/ui/Toggle';

// ─── Types ─────────────────────────────────────────────────────────────────

type DayKey = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

type DayHorario = { aberto: boolean; abertura: string; fechamento: string };

type Horarios = Record<DayKey, DayHorario>;

interface ConfiguracoesProps {
  session: AdminSession;
  slug: string;
  lojaAberta: boolean;
  mensagemFechado: string;
  horarios?: Partial<Horarios>;
  taxaEntregaTipo?: string;
  taxaEntregaValor?: number;
  pedidoMinimo?: number;
  lat?: number | null;
  lng?: number | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const DIAS: { key: DayKey; label: string }[] = [
  { key: 'segunda',  label: 'Segunda'  },
  { key: 'terca',    label: 'Terça'    },
  { key: 'quarta',   label: 'Quarta'   },
  { key: 'quinta',   label: 'Quinta'   },
  { key: 'sexta',    label: 'Sexta'    },
  { key: 'sabado',   label: 'Sábado'   },
  { key: 'domingo',  label: 'Domingo'  },
];

const DEFAULT_HORARIO: DayHorario = { aberto: true, abertura: '08:00', fechamento: '22:00' };

function buildHorarios(h?: Partial<Horarios>): Horarios {
  const result = {} as Horarios;
  DIAS.forEach(({ key }) => {
    result[key] = h?.[key] ?? { ...DEFAULT_HORARIO };
  });
  return result;
}

// ─── Shared styles ─────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 13,
  width: '100%',
  outline: 'none',
};

const sectionCard: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  padding: 20,
};

// ─── Section header ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-700 text-sm mb-4" style={{ color: 'var(--color-text)' }}>
      {children}
    </h3>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function Configuracoes({ session, slug, lojaAberta, mensagemFechado, horarios, taxaEntregaTipo = 'nenhuma', taxaEntregaValor = 0, pedidoMinimo = 0, lat = null, lng = null }: ConfiguracoesProps) {
  // ── Status ──────────────────────────────────────────────────────────────
  const [lojaAbertaState, setLojaAbertaState] = useState(lojaAberta);
  const [togglingLoja, setTogglingLoja] = useState(false);
  const [mensagemState, setMensagemState] = useState(mensagemFechado);
  const [savingMensagem, setSavingMensagem] = useState(false);

  // ── Horários ────────────────────────────────────────────────────────────
  const [horariosState, setHorariosState] = useState<Horarios>(() => buildHorarios(horarios));
  const [savingHorarios, setSavingHorarios] = useState(false);

  // ── Taxa de entrega ──────────────────────────────────────────────────────
  const [taxaAtiva, setTaxaAtiva] = useState(taxaEntregaTipo !== 'nenhuma');
  const [taxaTipo, setTaxaTipo] = useState<'fixa' | 'km'>(taxaEntregaTipo === 'km' ? 'km' : 'fixa');
  const [taxaValor, setTaxaValor] = useState(taxaEntregaValor);
  const [pedidoMinimoState, setPedidoMinimoState] = useState(pedidoMinimo);
  const [enderecoLoja, setEnderecoLoja] = useState('');
  const [enderecoFormatado, setEnderecoFormatado] = useState('');
  const [latState, setLatState] = useState<number | null>(lat != null ? Number(lat) : null);
  const [lngState, setLngState] = useState<number | null>(lng != null ? Number(lng) : null);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    (lat != null && lng != null && Number(lat) !== 0 && Number(lng) !== 0) ? 'success' : 'idle',
  );
  const [savingTaxa, setSavingTaxa] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const catalogUrl = `${window.location.origin}/${slug}`;

  const handleToggleLoja = async (aberta: boolean) => {
    setLojaAbertaState(aberta);
    setTogglingLoja(true);
    try {
      await toggleLojaAberta(session.merchant_id, session.token, aberta);
    } catch {
      setLojaAbertaState(!aberta);
    } finally {
      setTogglingLoja(false);
    }
  };

  const handleSaveMensagem = async () => {
    if (!mensagemState.trim()) return;
    setSavingMensagem(true);
    try {
      await atualizarMensagemFechado(session.merchant_id, session.token, mensagemState.trim());
    } catch {
      // silent — user sees no change
    } finally {
      setSavingMensagem(false);
    }
  };

  const setDayField = (key: DayKey, field: keyof DayHorario, value: string | boolean) => {
    setHorariosState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSaveHorarios = async () => {
    setSavingHorarios(true);
    try {
      await atualizarHorarios(session.merchant_id, session.token, horariosState);
    } catch {
      // silent
    } finally {
      setSavingHorarios(false);
    }
  };

  const handleGeocodificar = async () => {
    if (!enderecoLoja.trim()) return;
    setGeocodingStatus('loading');
    try {
      const result = await geocodificarEndereco(session.merchant_id, session.token, enderecoLoja.trim());
      if (result.sucesso) {
        setLatState(result.lat);
        setLngState(result.lng);
        setEnderecoFormatado(result.endereco_formatado);
        setGeocodingStatus('success');
      } else {
        setGeocodingStatus('error');
      }
    } catch {
      setGeocodingStatus('error');
    }
  };

  const handleSaveTaxa = async () => {
    setSavingTaxa(true);
    try {
      const tipoFinal = taxaAtiva ? taxaTipo : 'nenhuma';
      await salvarTaxaEntrega(session.merchant_id, session.token, {
        taxa_entrega_tipo: tipoFinal,
        taxa_entrega_valor: taxaValor,
        pedido_minimo: pedidoMinimoState,
        lat: tipoFinal === 'km' ? latState : null,
        lng: tipoFinal === 'km' ? lngState : null,
      });
    } catch {
      // silent
    } finally {
      setSavingTaxa(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5">

      {/* ── Seção 1: Status da loja ──────────────────────────────────────── */}
      <div style={sectionCard}>
        <SectionTitle>Status da Loja</SectionTitle>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Toggle
              checked={lojaAbertaState}
              onChange={handleToggleLoja}
              disabled={togglingLoja}
              ariaLabel="Alternar status da loja"
            />
            <span
              className="text-sm font-600"
              style={{ color: lojaAbertaState ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            >
              {lojaAbertaState ? 'Loja Aberta' : 'Loja Fechada'}
            </span>
          </div>

          <div>
            <label htmlFor="cfg-mensagem" className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Mensagem de loja fechada
            </label>
            <input
              id="cfg-mensagem"
              type="text"
              value={mensagemState}
              onChange={(e) => setMensagemState(e.target.value)}
              placeholder="Estamos fechados no momento. Volte em breve!"
              style={inputStyle}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Exibida no banner quando a loja estiver fechada.
            </p>
          </div>

          <button
            onClick={handleSaveMensagem}
            disabled={savingMensagem || !mensagemState.trim()}
            className="px-4 py-2 rounded-xl text-sm font-600 transition-opacity disabled:opacity-40 hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', cursor: 'pointer' }}
          >
            {savingMensagem ? 'Salvando...' : 'Salvar Mensagem'}
          </button>
        </div>
      </div>

      {/* ── Seção 2: Horários ─────────────────────────────────────────────── */}
      <div style={sectionCard}>
        <SectionTitle>Horários de Funcionamento</SectionTitle>

        <div className="space-y-2">
          {/* Table header */}
          <div className="grid gap-2 pb-2" style={{ gridTemplateColumns: '100px 1fr 1fr 1fr', borderBottom: '1px solid var(--color-border)' }}>
            {['Dia', 'Aberto', 'Abertura', 'Fechamento'].map((h) => (
              <span key={h} className="text-[10px] font-600 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {DIAS.map(({ key, label }) => {
            const dia = horariosState[key];
            return (
              <div
                key={key}
                className="grid gap-2 py-2 items-center"
                style={{
                  gridTemplateColumns: '100px 1fr 1fr 1fr',
                  borderBottom: '1px solid var(--color-border)',
                  opacity: dia.aberto ? 1 : 0.5,
                }}
              >
                <span className="text-sm font-500" style={{ color: 'var(--color-text)' }}>{label}</span>
                <div>
                  <Toggle
                    checked={dia.aberto}
                    onChange={(v) => setDayField(key, 'aberto', v)}
                    ariaLabel={`${label} aberto`}
                  />
                </div>
                <input
                  type="time"
                  value={dia.abertura}
                  disabled={!dia.aberto}
                  onChange={(e) => setDayField(key, 'abertura', e.target.value)}
                  style={{ ...inputStyle, opacity: dia.aberto ? 1 : 0.4 }}
                />
                <input
                  type="time"
                  value={dia.fechamento}
                  disabled={!dia.aberto}
                  onChange={(e) => setDayField(key, 'fechamento', e.target.value)}
                  style={{ ...inputStyle, opacity: dia.aberto ? 1 : 0.4 }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            onClick={handleSaveHorarios}
            disabled={savingHorarios}
            className="px-4 py-2 rounded-xl text-sm font-600 transition-opacity disabled:opacity-40 hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', cursor: 'pointer' }}
          >
            {savingHorarios ? 'Salvando...' : 'Salvar Horários'}
          </button>
        </div>
      </div>

      {/* ── Seção 3: Taxa de Entrega ──────────────────────────────────────── */}
      <div style={sectionCard}>
        <SectionTitle>Taxa de Entrega</SectionTitle>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Toggle
              checked={taxaAtiva}
              onChange={setTaxaAtiva}
              ariaLabel="Ativar taxa de entrega"
            />
            <span
              className="text-sm font-600"
              style={{ color: taxaAtiva ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            >
              {taxaAtiva ? 'Taxa ativa' : 'Sem taxa de entrega'}
            </span>
          </div>

          {taxaAtiva && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-600 mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Tipo de taxa
                </p>
                <div className="flex gap-2">
                  {(['fixa', 'km'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaxaTipo(t)}
                      className="px-3 py-1.5 rounded-lg text-xs font-700 transition-all"
                      style={{
                        backgroundColor: taxaTipo === t ? 'rgb(245 166 35 / 0.15)' : 'var(--color-surface-2)',
                        color: taxaTipo === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        border: `1px solid ${taxaTipo === t ? 'rgb(245 166 35 / 0.4)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {t === 'fixa' ? 'Fixa' : 'Por KM'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cfg-taxa-valor" className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {taxaTipo === 'km' ? 'Valor por KM (R$/km)' : 'Valor da taxa (R$)'}
                </label>
                <input
                  id="cfg-taxa-valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxaValor}
                  onChange={(e) => setTaxaValor(Number(e.target.value))}
                  placeholder="0,00"
                  style={inputStyle}
                />
                {taxaTipo === 'km' && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    Ex: R$ 2,00/km — distância arredondada para cima
                  </p>
                )}
              </div>

              {taxaTipo === 'km' && (
                <div>
                  <p className="text-xs font-600 mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Endereço do estabelecimento
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={enderecoLoja}
                      onChange={(e) => { setEnderecoLoja(e.target.value); setGeocodingStatus('idle'); }}
                      placeholder="Rua, número, cidade..."
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleGeocodificar}
                      disabled={!enderecoLoja.trim() || geocodingStatus === 'loading'}
                      className="px-3 py-2 rounded-xl text-xs font-600 shrink-0 transition-opacity disabled:opacity-40 hover:opacity-85"
                      style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', cursor: 'pointer', border: 'none' }}
                    >
                      {geocodingStatus === 'loading' ? '...' : 'Localizar'}
                    </button>
                  </div>
                  {geocodingStatus === 'success' && (
                    <p className="text-xs mt-1.5 font-600" style={{ color: '#10B981' }}>
                      Endereço localizado: {enderecoFormatado || `(${Number(latState).toFixed(4)}, ${Number(lngState).toFixed(4)})`}
                    </p>
                  )}
                  {geocodingStatus === 'error' && (
                    <p className="text-xs mt-1.5" style={{ color: '#F87171' }}>
                      Endereço não encontrado. Tente ser mais específico.
                    </p>
                  )}
                  {geocodingStatus === 'idle' && latState && lngState && (
                    <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      Localização configurada — clique em Localizar para atualizar.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="cfg-pedido-minimo" className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Pedido minimo (R$)
                </label>
                <input
                  id="cfg-pedido-minimo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pedidoMinimoState}
                  onChange={(e) => setPedidoMinimoState(Number(e.target.value))}
                  placeholder="0,00"
                  style={inputStyle}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  0 = sem pedido minimo
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSaveTaxa}
            disabled={savingTaxa}
            className="px-4 py-2 rounded-xl text-sm font-600 transition-opacity disabled:opacity-40 hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', cursor: 'pointer' }}
          >
            {savingTaxa ? 'Salvando...' : 'Salvar Taxa'}
          </button>
        </div>
      </div>

      {/* ── Seção 4: Link do Cardápio ─────────────────────────────────────── */}
      <div style={sectionCard}>
        <SectionTitle>Link do Cardápio</SectionTitle>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div
            className="flex-1 px-3 py-2.5 rounded-xl text-sm font-500 truncate"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'monospace',
            }}
          >
            {catalogUrl}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-600 transition-all hover:opacity-85"
              style={{
                backgroundColor: copied ? 'rgb(16 185 129 / 0.12)' : 'var(--color-surface-2)',
                border: `1px solid ${copied ? '#10B981' : 'var(--color-border)'}`,
                color: copied ? '#10B981' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {copied ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </button>

            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-600 transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
