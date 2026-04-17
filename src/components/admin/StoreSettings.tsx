import { useState, useRef } from 'react';
import type { AdminSession } from '@/types/admin';
import { atualizarLogo } from '@/services/api';
import { uploadImagem } from '@/services/cloudinary';

interface StoreSettingsProps {
  session: AdminSession;
  nomeLoja: string;
  logoUrl: string;
  onLogoUpdated: (url: string) => void;
  onToast: (type: 'success' | 'error', title: string, msg?: string) => void;
}

export function StoreSettings({ session, nomeLoja, logoUrl, onLogoUpdated, onToast }: StoreSettingsProps) {
  const [inputUrl, setInputUrl] = useState(logoUrl);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!inputUrl.trim()) return;
    setLoading(true);
    try {
      await atualizarLogo(session.merchant_id, session.token, inputUrl.trim());
      onLogoUpdated(inputUrl.trim());
      onToast('success', 'Logo atualizada com sucesso!');
    } catch {
      onToast('error', 'Erro ao salvar logo', 'Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImagem(file);
      setInputUrl(url);
      setPreviewError(false);
      await atualizarLogo(session.merchant_id, session.token, url);
      onLogoUpdated(url);
      onToast('success', 'Logo atualizada com sucesso!');
    } catch {
      onToast('error', 'Erro ao fazer upload', 'Tente novamente em instantes.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const inicial = nomeLoja.charAt(0).toUpperCase();
  const showPreview = inputUrl && !previewError;

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

  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h2 className="font-700 text-sm mb-4" style={{ color: 'var(--color-text)' }}>Configurações da Loja</h2>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Preview */}
        <div className="flex-shrink-0 relative">
          {showPreview ? (
            <img
              src={inputUrl}
              alt="Logo da loja"
              className="w-24 h-24 rounded-full object-cover"
              style={{ border: '2px solid var(--color-border)' }}
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-700"
              style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
            >
              {inicial}
            </div>
          )}
          {/* Botão de upload sobre o avatar */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', border: '2px solid var(--color-background)' }}
            title="Fazer upload de imagem"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 20 20" fill="#0D0D0D" className="w-3.5 h-3.5">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Form */}
        <div className="flex-1 space-y-3 w-full">
          <div>
            <label htmlFor="logo-url" className="block text-xs font-600 mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              URL da logo
            </label>
            <input
              id="logo-url"
              type="url"
              value={inputUrl}
              onChange={(e) => { setInputUrl(e.target.value); setPreviewError(false); }}
              placeholder="https://exemplo.com/logo.png"
              style={inputStyle}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Cole um link ou clique no ícone da foto para fazer upload direto do seu computador.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || uploading || !inputUrl.trim()}
            className="px-4 py-2 rounded-xl text-sm font-600 transition-opacity disabled:opacity-40 hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
          >
            {loading ? 'Salvando...' : 'Salvar Logo'}
          </button>
        </div>
      </div>
    </div>
  );
}