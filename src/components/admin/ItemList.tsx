import { useRef, useState } from 'react';
import type { Categoria, Item } from '@/types/catalog';
import type { AdminSession } from '@/types/admin';
import { atualizarDisponibilidade, deletarItem, editarItem } from '@/services/api';
import { uploadImagem } from '@/services/cloudinary';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';

interface ItemListProps {
  categorias: Categoria[];
  session: AdminSession;
  onRefresh: () => void;
  onAddFirst: () => void;
  onToast: (type: 'success' | 'error', title: string, msg?: string) => void;
}

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: 6,
};

// ─── Delete Modal ──────────────────────────────────────────────────────────

function DeleteModal({ item, onConfirm, onCancel }: {
  item: Item | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative rounded-2xl p-6 max-w-xs w-full z-10"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <h3 className="font-700 text-base mb-2" style={{ color: 'var(--color-text)' }}>Excluir item</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          Tem certeza que deseja excluir{' '}
          <strong style={{ color: 'var(--color-text)' }}>{item.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-600"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-600 hover:opacity-90"
            style={{ backgroundColor: '#EF4444', color: '#fff' }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────

interface EditTarget { item: Item; categoria: string }

function EditModal({ target, categoriasExistentes, session, onClose, onSaved, onToast }: {
  target: EditTarget;
  categoriasExistentes: string[];
  session: AdminSession;
  onClose: () => void;
  onSaved: () => void;
  onToast: ItemListProps['onToast'];
}) {
  const { item, categoria: categoriaInicial } = target;

  const [form, setForm] = useState({
    categoria: categoriaInicial,
    nome: item.nome,
    descricao: item.descricao,
    preco: String(item.preco).replace('.', ','),
    foto_url: item.foto_url,
    disponivel: item.disponivel,
  });
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'foto_url') setPreviewError(false);
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImagem(file);
      set('foto_url', url);
    } catch {
      onToast('error', 'Erro ao fazer upload', 'Tente novamente.');
    } finally {
      setUploading(false);
      if (fotoInputRef.current) fotoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.categoria || !form.preco) {
      onToast('error', 'Preencha os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const res = await editarItem(session.merchant_id, session.token, item.id, {
        categoria: form.categoria,
        nome: form.nome,
        descricao: form.descricao,
        preco: parseFloat(form.preco.replace(',', '.')),
        foto_url: form.foto_url,
        disponivel: form.disponivel,
      });
      if (res.sucesso) {
        onToast('success', `"${form.nome}" atualizado!`);
        onSaved();
        onClose();
      } else {
        onToast('error', 'Erro ao salvar', res.mensagem);
      }
    } catch {
      onToast('error', 'Erro ao salvar item', 'Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full md:max-w-lg z-10 rounded-t-2xl md:rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h3 className="font-700 text-sm" style={{ color: 'var(--color-text)' }}>Editar Item</h3>
          <button
            onClick={onClose}
            className="opacity-40 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-text)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Categoria *</label>
              <input
                list="edit-categorias"
                value={form.categoria}
                onChange={(e) => set('categoria', e.target.value)}
                required
                style={inputStyle}
                placeholder="Ex: Pizzas"
              />
              <datalist id="edit-categorias">
                {categoriasExistentes.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label style={labelStyle}>Preço (R$) *</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.preco}
                onChange={(e) => set('preco', e.target.value)}
                required
                style={inputStyle}
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Descrição{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({form.descricao.length}/200)</span>
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value.slice(0, 200))}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              placeholder="Ingredientes, tamanho..."
            />
          </div>

          <div>
            <label style={labelStyle}>Foto</label>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={form.foto_url}
                onChange={(e) => set('foto_url', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                disabled={uploading}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-600 hover:opacity-85 disabled:opacity-50 flex items-center gap-1.5 transition-opacity"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                Upload
              </button>
              <input ref={fotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFotoUpload} />
              {form.foto_url && !previewError && (
                <img
                  src={form.foto_url}
                  alt="preview"
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--color-border)' }}
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          </div>

          <Toggle
            checked={form.disponivel}
            onChange={(v) => set('disponivel', v)}
            label="Disponível para venda"
            ariaLabel="Disponibilidade"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-600"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-700 disabled:opacity-50 hover:opacity-85 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D', cursor: 'pointer' }}
            >
              {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Item Row ──────────────────────────────────────────────────────────────

function ItemRow({ item, categoria, session, onEdit, onDelete, onToast }: {
  item: Item;
  categoria: string;
  session: AdminSession;
  onEdit: (item: Item, categoria: string) => void;
  onDelete: (item: Item) => void;
  onToast: ItemListProps['onToast'];
}) {
  const [disponivel, setDisponivel] = useState(item.disponivel);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setDisponivel(checked);
    setLoading(true);
    try {
      await atualizarDisponibilidade(session.merchant_id, session.token, item.id, checked);
    } catch {
      setDisponivel(!checked);
      onToast('error', 'Erro ao atualizar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
      {item.foto_url && (
        <img
          src={item.foto_url}
          alt={item.nome}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-600 truncate" style={{ color: 'var(--color-text)' }}>{item.nome}</p>
        <p className="text-xs" style={{ color: 'var(--color-primary)' }}>{formatCurrency(item.preco)}</p>
      </div>
      <Badge variant={disponivel ? 'success' : 'error'}>
        {disponivel ? 'Disponível' : 'Indisponível'}
      </Badge>
      <Toggle
        checked={disponivel}
        onChange={handleToggle}
        disabled={loading}
        ariaLabel={`Disponibilidade de ${item.nome}`}
      />
      <button
        onClick={() => onEdit(item, categoria)}
        aria-label={`Editar ${item.nome}`}
        className="transition-opacity opacity-30 hover:opacity-100"
        style={{ color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(item)}
        aria-label={`Excluir ${item.nome}`}
        className="transition-opacity opacity-30 hover:opacity-100 ml-1"
        style={{ color: '#F87171', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// ─── Item List ─────────────────────────────────────────────────────────────

export function ItemList({ categorias, session, onRefresh, onAddFirst, onToast }: ItemListProps) {
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const totalItens = categorias.reduce((s, c) => s + c.itens.length, 0);
  const categoriasExistentes = categorias.map((c) => c.nome);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deletarItem(session.merchant_id, session.token, itemToDelete.id);
      onToast('success', `"${itemToDelete.nome}" excluído.`);
      onRefresh();
    } catch {
      onToast('error', 'Erro ao excluir item');
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  if (totalItens === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-14 h-14 opacity-20" style={{ color: 'var(--color-text-secondary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm font-500" style={{ color: 'var(--color-text-secondary)' }}>Nenhum item cadastrado ainda</p>
        <button
          onClick={onAddFirst}
          className="px-4 py-2 rounded-xl text-sm font-600 hover:opacity-85 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
        >
          Adicionar primeiro item
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {categorias.map((cat) => (
          <div
            key={cat.nome}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}
            >
              <h3 className="font-700 text-sm" style={{ color: 'var(--color-text)' }}>{cat.nome}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}
              >
                {cat.itens.length} {cat.itens.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <div className="px-4">
              {cat.itens.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  categoria={cat.nome}
                  session={session}
                  onEdit={(i, c) => setEditTarget({ item: i, categoria: c })}
                  onDelete={setItemToDelete}
                  onToast={onToast}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DeleteModal
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setItemToDelete(null)}
      />

      {editTarget && (
        <EditModal
          target={editTarget}
          categoriasExistentes={categoriasExistentes}
          session={session}
          onClose={() => setEditTarget(null)}
          onSaved={onRefresh}
          onToast={onToast}
        />
      )}
    </>
  );
}
