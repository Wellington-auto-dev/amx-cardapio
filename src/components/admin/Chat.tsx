import { useEffect, useState } from 'react';
import type { AdminSession } from '@/types/admin';
import { fetchChat } from '@/services/api';

interface ChatProps {
  session: AdminSession;
}

interface Mensagem {
  id: number;
  tipo: string;
  conteudo: string;
}

interface Conversa {
  session_id: string;
  nome: string;
  origem: string;
  total_mensagens: number;
  ultima_mensagem: string;
  ultimo_tipo: string;
  mensagens: Mensagem[];
}

function formatPhone(phone: string) {
  const p = phone.replace(/\D/g, '');
  if (p.length === 13) return `+${p.slice(0, 2)} (${p.slice(2, 4)}) ${p.slice(4, 9)}-${p.slice(9)}`;
  return phone;
}

function formatMensagem(texto: string) {
  return texto.replace(/\n/g, '<br/>');
}

export function Chat({ session }: ChatProps) {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetchChat(session.merchant_id, session.token)
      .then(res => {
        setConversas(res.conversas);
        if (res.conversas.length > 0) {
          setConversaAtiva(res.conversas[0].session_id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const conversasFiltradas = conversas.filter(c =>
    !busca || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.session_id.includes(busca)
  );

  const conversaAberta = conversas.find(c => c.session_id === conversaAtiva);

  const surfaceStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  };

  if (loading) {
    return (
      <div className="flex gap-4 h-[600px]">
        <div className="w-72 rounded-2xl animate-pulse" style={surfaceStyle} />
        <div className="flex-1 rounded-2xl animate-pulse" style={surfaceStyle} />
      </div>
    );
  }

  if (conversas.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={surfaceStyle}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm font-600" style={{ color: 'var(--color-text)' }}>Nenhuma conversa ainda</p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>As conversas dos clientes aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>Conversas</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Histórico de interações dos clientes com o agente
        </p>
      </div>

      {/* Layout chat */}
      <div className="flex gap-4" style={{ height: 600 }}>

        {/* Lista de conversas */}
        <div
          className="w-72 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden"
          style={surfaceStyle}
        >
          {/* Busca */}
          <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full text-xs rounded-xl pl-9 pr-3 py-2 outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {conversasFiltradas.map(conversa => (
              <div
                key={conversa.session_id}
                onClick={() => setConversaAtiva(conversa.session_id)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                style={{
                  backgroundColor: conversaAtiva === conversa.session_id
                    ? 'var(--color-surface-2)'
                    : 'transparent',
                  borderBottom: '1px solid var(--color-border)',
                  borderLeft: conversaAtiva === conversa.session_id
                    ? '2px solid var(--color-primary)'
                    : '2px solid transparent',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
                >
                  {conversa.nome.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-600 truncate" style={{ color: 'var(--color-text)' }}>
                      {conversa.nome}
                    </p>
                    <span className="text-xs flex-shrink-0 ml-1" style={{ color: 'var(--color-text-muted)' }}>
                      {conversa.total_mensagens}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {conversa.ultimo_tipo === 'human' ? '← ' : '→ '}
                    {conversa.ultima_mensagem}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversa aberta */}
        <div
          className="flex-1 rounded-2xl flex flex-col overflow-hidden"
          style={surfaceStyle}
        >
          {conversaAberta ? (
            <>
              {/* Header da conversa */}
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
                >
                  {conversaAberta.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-700" style={{ color: 'var(--color-text)' }}>
                    {conversaAberta.nome}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatPhone(conversaAberta.session_id)} · {conversaAberta.total_mensagens} mensagens · {conversaAberta.origem}
                  </p>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversaAberta.mensagens.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.tipo === 'human' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed"
                      style={{
                        backgroundColor: msg.tipo === 'human'
                          ? 'var(--color-primary)'
                          : 'var(--color-surface-2)',
                        color: msg.tipo === 'human'
                          ? '#0D0D0D'
                          : 'var(--color-text)',
                        borderBottomRightRadius: msg.tipo === 'human' ? 4 : 16,
                        borderBottomLeftRadius: msg.tipo === 'ai' ? 4 : 16,
                      }}
                      dangerouslySetInnerHTML={{ __html: formatMensagem(msg.conteudo) }}
                    />
                  </div>
                ))}
              </div>

              {/* Rodapé informativo */}
              <div
                className="px-5 py-3 text-center"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Visualização somente leitura — as respostas são geradas pelo agente de IA
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Selecione uma conversa para visualizar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}