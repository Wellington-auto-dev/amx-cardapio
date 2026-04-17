import { useState, useId, useRef } from 'react';
import type { AdminSession, GrupoManualPayload } from '@/types/admin';
import { inserirItemManual } from '@/services/api';
import { Toggle } from '@/components/ui/Toggle';
import { uploadImagem } from '@/services/cloudinary';

interface ManualItemFormProps {
  session: AdminSession;
  categoriasExistentes: string[];
  onSuccess: () => void;
  onToast: (type: 'success' | 'error', title: string, msg?: string) => void;
}

const GRUPO_VAZIO = (): GrupoManualPayload => ({
  nome: '', obrigatorio: false, minimo: 1, maximo: 1,
  opcoes: [{ nome: '', preco_adicional: 0 }],
});
const FORM_VAZIO = { categoria: '', nome: '', descricao: '', preco: '', foto_url: '', disponivel: true };

export function ManualItemForm({ session, categoriasExistentes, onSuccess, onToast }: ManualItemFormProps) {
  const uid = useId();
  const [form, setForm] = useState({ ...FORM_VAZIO });
  const [grupos, setGrupos] = useState<GrupoManualPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const datalistId = `${uid}-cat`;

  const setField = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'foto_url') setPreviewError(false);
  };

  const addGrupo = () => setGrupos((p) => [...p, GRUPO_VAZIO()]);
  const removeGrupo = (idx: number) => setGrupos((p) => p.filter((_, i) => i !== idx));
  const updateGrupo = (idx: number, patch: Partial<GrupoManualPayload>) =>
    setGrupos((p) => p.map((g, i) => i === idx ? { ...g, ...patch } : g));
  const addOpcao = (gi: number) =>
    setGrupos((p) => p.map((g, i) => i === gi ? { ...g, opcoes: [...g.opcoes, { nome: '', preco_adicional: 0 }] } : g));
  const removeOpcao = (gi: number, oi: number) =>
    setGrupos((p) => p.map((g, i) => i === gi ? { ...g, opcoes: g.opcoes.filter((_, j) => j !== oi) } : g));
  const updateOpcao = (gi: number, oi: number, field: 'nome' | 'preco_adicional', value: string | number) =>
    setGrupos((p) => p.map((g, i) => i === gi ? { ...g, opcoes: g.opcoes.map((o, j) => j === oi ? { ...o, [field]: value } : o) } : g));

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    try {
      const url = await uploadImagem(file);
      setField('foto_url', url);
    } catch {
      onToast('error', 'Erro ao fazer upload', 'Tente novamente.');
    } finally {
      setUploadingFoto(false);
      if (fotoInputRef.current) fotoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.categoria || !form.preco) {
      onToast('error', 'Preencha os campos obrigatórios', 'Categoria, nome e preço são obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      await inserirItemManual({
        merchant_id: session.merchant_id,
        token: session.token,
        categoria: form.categoria,
        nome: form.nome,
        descricao: form.descricao,
        preco: parseFloat(form.preco.replace(',', '.')),
        disponivel: form.disponivel,
        foto_url: form.foto_url,
        grupos,
      });
      onToast('success', `"${form.nome}" adicionado com sucesso!`);
      setForm({ ...FORM_VAZIO });
      setGrupos([]);
      onSuccess();
    } catch {
      onToast('error', 'Erro ao salvar item', 'Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 20,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      {/* Informações básicas */}
      <div style={sectionStyle} className="space-y-4">
        <h3
          className="font-700 text-sm pb-3"
          style={{ color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
        >
          Informações do Item
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${uid}-categoria`} style={labelStyle}>Categoria *</label>
            <input
              id={`${uid}-categoria`}
              list={datalistId}
              value={form.categoria}
              onChange={(e) => setField('categoria', e.target.value)}
              placeholder="Ex: Pizzas, Bebidas..."
              required
              style={inputStyle}
            />
            <datalist id={datalistId}>
              {categoriasExistentes.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label htmlFor={`${uid}-preco`} style={labelStyle}>Preço (R$) *</label>
            <input
              id={`${uid}-preco`}
              type="text"
              inputMode="decimal"
              value={form.preco}
              onChange={(e) => setField('preco', e.target.value)}
              placeholder="0,00"
              required
              style={inputStyle}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-nome`} style={labelStyle}>Nome do item *</label>
            <input
              id={`${uid}-nome`}
              type="text"
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              placeholder="Ex: Pizza Portuguesa"
              required
              style={inputStyle}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-descricao`} style={labelStyle}>
              Descrição <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({form.descricao.length}/200)</span>
            </label>
            <textarea
              id={`${uid}-descricao`}
              value={form.descricao}
              onChange={(e) => setField('descricao', e.target.value.slice(0, 200))}
              placeholder="Ingredientes, tamanho, características..."
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-foto`} style={labelStyle}>Foto do item</label>
            <div className="flex gap-3 items-center">
              <input
                id={`${uid}-foto`}
                type="url"
                value={form.foto_url}
                onChange={(e) => setField('foto_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                disabled={uploadingFoto}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-600 transition-opacity hover:opacity-85 disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                {uploadingFoto ? (
                  <div className="w-3.5 h-3.5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                Upload
              </button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFotoUpload}
              />
              {form.foto_url && !previewError && (
                <img
                  src={form.foto_url}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--color-border)' }}
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Toggle
              checked={form.disponivel}
              onChange={(v) => setField('disponivel', v)}
              label="Disponível para venda"
              ariaLabel="Disponibilidade do item"
            />
          </div>
        </div>
      </div>

      {/* Grupos de personalização */}
      <div style={sectionStyle} className="space-y-4">
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h3 className="font-700 text-sm" style={{ color: 'var(--color-text)' }}>Personalização</h3>
          <button
            type="button"
            onClick={addGrupo}
            className="text-xs font-600 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-75"
            style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'transparent' }}
          >
            + Adicionar Grupo
          </button>
        </div>

        {grupos.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            Nenhum grupo de opções. Clique em "Adicionar Grupo" para incluir variações como tamanho, borda, etc.
          </p>
        )}

        {grupos.map((grupo, gi) => (
          <div
            key={gi}
            className="rounded-xl p-4 space-y-3 relative"
            style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
          >
            <button
              type="button"
              onClick={() => removeGrupo(gi)}
              aria-label="Remover grupo"
              className="absolute top-3 right-3 opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: '#F87171' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div>
              <label style={labelStyle}>Nome do grupo</label>
              <input
                type="text"
                value={grupo.nome}
                onChange={(e) => updateGrupo(gi, { nome: e.target.value })}
                placeholder="Ex: Tamanho, Borda, Acompanhamento"
                style={{ ...inputStyle, backgroundColor: 'var(--color-surface-3)' }}
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Toggle
                checked={grupo.obrigatorio}
                onChange={(v) => updateGrupo(gi, { obrigatorio: v })}
                label="Obrigatório"
              />
              <div className="flex items-center gap-3">
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Mínimo</label>
                  <input
                    type="number" min={0} value={grupo.minimo}
                    onChange={(e) => updateGrupo(gi, { minimo: Number(e.target.value) })}
                    style={{ ...inputStyle, width: 64, textAlign: 'center', padding: '6px 8px', backgroundColor: 'var(--color-surface-3)' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Máximo</label>
                  <input
                    type="number" min={1} value={grupo.maximo}
                    onChange={(e) => updateGrupo(gi, { maximo: Number(e.target.value) })}
                    style={{ ...inputStyle, width: 64, textAlign: 'center', padding: '6px 8px', backgroundColor: 'var(--color-surface-3)' }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label style={labelStyle}>Opções</label>
              {grupo.opcoes.map((opcao, oi) => (
                <div key={oi} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opcao.nome}
                    onChange={(e) => updateOpcao(gi, oi, 'nome', e.target.value)}
                    placeholder="Nome da opção"
                    style={{ ...inputStyle, flex: 1, backgroundColor: 'var(--color-surface-3)' }}
                  />
                  <div
                    className="flex items-center rounded-lg overflow-hidden"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    <span
                      className="px-2 text-sm py-2"
                      style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-secondary)', borderRight: '1px solid var(--color-border)' }}
                    >
                      R$
                    </span>
                    <input
                      type="number" step="0.01"
                      value={opcao.preco_adicional}
                      onChange={(e) => updateOpcao(gi, oi, 'preco_adicional', parseFloat(e.target.value) || 0)}
                      style={{ ...inputStyle, width: 72, borderRadius: 0, border: 'none', backgroundColor: 'var(--color-surface-3)', padding: '8px' }}
                      placeholder="0,00"
                    />
                  </div>
                  {grupo.opcoes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOpcao(gi, oi)}
                      aria-label="Remover opção"
                      className="opacity-40 hover:opacity-100 transition-opacity"
                      style={{ color: '#F87171' }}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOpcao(gi)}
                className="text-xs mt-1 hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                + Adicionar opção
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => { setForm({ ...FORM_VAZIO }); setGrupos([]); }}
          className="px-5 py-2.5 rounded-xl text-sm font-600 transition-colors"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
        >
          Limpar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-700 disabled:opacity-50 hover:opacity-85 transition-opacity flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
        >
          {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          {loading ? 'Salvando...' : 'Salvar Item'}
        </button>
      </div>
    </form>
  );
}