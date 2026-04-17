import { useRef, useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { importarMarketplace, uploadPlanilha } from '@/services/api';
import { gerarModeloExcel, parsePlanilha, montarPayloadPlanilha } from '@/services/excel';

interface ImportCardProps {
  session: AdminSession;
  onSuccess: () => void;
  onTabChange: (tab: number) => void;
  onToast: (type: 'success' | 'error', title: string, msg?: string) => void;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export function ImportCard({ session, onSuccess, onTabChange, onToast }: ImportCardProps) {
  const [loadingMarketplace, setLoadingMarketplace] = useState(false);
  const [loadingPlanilha, setLoadingPlanilha] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportMarketplace = async () => {
    setLoadingMarketplace(true);
    try {
      const res = await importarMarketplace(session.merchant_id, session.token);
      if (res.sucesso) {
        onToast('success', `${res.itens_importados} itens importados com sucesso!`);
        onSuccess();
      } else {
        onToast('error', 'Importação com erros', res.erros.join('; '));
      }
    } catch {
      onToast('error', 'Erro ao importar', 'Verifique sua conexão e tente novamente.');
    } finally {
      setLoadingMarketplace(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      onToast('error', 'Formato inválido', 'Selecione um arquivo .xlsx ou .xls');
      return;
    }
    setLoadingPlanilha(true);
    setUploadProgress(30);
    try {
      const parsed = await parsePlanilha(file);
      setUploadProgress(60);
      const payload = montarPayloadPlanilha(parsed);
      setUploadProgress(80);
      const res = await uploadPlanilha(session.merchant_id, session.token, payload);
      setUploadProgress(100);
      if (res.sucesso) {
        onToast('success', `${res.itens_inseridos} itens importados!`,
          res.erros.length > 0 ? `Avisos: ${res.erros.join('; ')}` : undefined);
        onSuccess();
      } else {
        onToast('error', 'Erros no upload', res.erros.join('; '));
      }
    } catch (err) {
      onToast('error', 'Erro ao processar planilha', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setLoadingPlanilha(false);
      setUploadProgress(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const iconBox = (color: string, bg: string, children: React.ReactNode) => (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" style={{ color }}>
        {children}
      </svg>
    </div>
  );

  const outlineBtn: React.CSSProperties = {
    border: '1px solid var(--color-primary)',
    color: 'var(--color-primary)',
    borderRadius: 12,
    padding: '10px 0',
    fontSize: 14,
    fontWeight: 600,
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.15s',
    width: '100%',
    marginTop: 'auto',
  };

  const primaryBtn: React.CSSProperties = {
    backgroundColor: 'var(--color-primary)',
    color: '#0D0D0D',
    borderRadius: 12,
    padding: '10px 0',
    fontSize: 14,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginTop: 'auto',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card A — Marketplace */}
      <div style={cardStyle}>
        {iconBox('#60A5FA', 'rgb(96 165 250 / 0.12)',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        )}
        <div>
          <h3 className="font-700 text-sm mb-1" style={{ color: 'var(--color-text)' }}>Importar do Marketplace</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Importa automaticamente todos os itens da sua loja no marketplace de delivery.
          </p>
        </div>
        <button
          onClick={handleImportMarketplace}
          disabled={loadingMarketplace}
          style={{ ...outlineBtn, opacity: loadingMarketplace ? 0.5 : 1 }}
        >
          {loadingMarketplace ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Importando...
            </>
          ) : 'Importar Agora'}
        </button>
      </div>

      {/* Card B — Planilha */}
      <div style={cardStyle}>
        {iconBox('#34D399', 'rgb(52 211 153 / 0.12)',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        )}
        <div>
          <h3 className="font-700 text-sm mb-1" style={{ color: 'var(--color-text)' }}>Enviar Planilha Excel</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Preencha o modelo padrão e faça o upload.
          </p>
          <button
            onClick={gerarModeloExcel}
            className="mt-2 text-xs flex items-center gap-1 hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Baixar Modelo
          </button>
        </div>

        {/* Drag and drop */}
        <div
          className="rounded-xl p-4 text-center cursor-pointer transition-colors"
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
            backgroundColor: dragOver ? 'rgb(245 166 35 / 0.05)' : 'var(--color-surface-2)',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="Selecionar arquivo Excel"
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileInput} />
          {loadingPlanilha ? (
            <div className="space-y-2">
              <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Processando...</p>
              {uploadProgress !== null && (
                <div className="w-full rounded-full h-1.5 mt-1" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
              )}
            </div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Arraste ou <span style={{ color: 'var(--color-primary)' }}>clique para selecionar</span>
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Aceita .xlsx e .xls</p>
            </>
          )}
        </div>
      </div>

      {/* Card C — Manual */}
      <div style={cardStyle}>
        {iconBox('#C084FC', 'rgb(192 132 252 / 0.12)',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        )}
        <div>
          <h3 className="font-700 text-sm mb-1" style={{ color: 'var(--color-text)' }}>Adicionar Item Manual</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Cadastre um item diretamente pelo painel, preenchendo todos os detalhes.
          </p>
        </div>
        <button onClick={() => onTabChange(2)} style={primaryBtn} className="hover:opacity-85 transition-opacity">
          Adicionar Item
        </button>
      </div>
    </div>
  );
}
