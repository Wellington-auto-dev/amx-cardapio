import axios from 'axios';
import type { Merchant, EnderecoCliente } from '@/types/catalog';
import type { ItemManualPayload, ClubVipConfig, ClubVipNivel, ClubVipSaldo, ClubVipResgate, CategoriaOrdem, GrupoEditPayload } from '@/types/admin';
import type { ParsedPlanilha } from '@/services/excel';
import { montarPayloadPlanilha } from '@/services/excel';

const BASE_URL = import.meta.env.VITE_N8N_BASE_URL as string;

const api = axios.create({ baseURL: BASE_URL });

// ─── Cardápio público ──────────────────────────────────────────────────────

export async function fetchCardapio(slug: string): Promise<Merchant> {
  const { data } = await api.get<Merchant>('/amx-cardapio-buscar', {
    params: { merchant_slug: slug },
  });
  return data;
}

// ─── Autenticação do lojista ───────────────────────────────────────────────

export async function validarToken(
  merchantSlug: string,
  token: string,
): Promise<{ valido: boolean; merchant_id: string }> {
  const { data } = await api.post('/amx-cardapio-validar-token', {
    merchant_slug: merchantSlug,
    token,
  });
  return data;
}

// ─── Importação do marketplace ─────────────────────────────────────────────

export async function importarMarketplace(
  merchantId: string,
  token: string,
): Promise<{ sucesso: boolean; mensagem: string }> {
  const { data } = await api.post('/amx-cardapio-importar-marketplace', {
    merchant_id: merchantId,
    token,
  });
  return data;
}

// ─── Upload de planilha ────────────────────────────────────────────────────

export async function uploadPlanilha(
  merchantId: string,
  token: string,
  parsed: ParsedPlanilha,
): Promise<{ sucesso: boolean; mensagem: string }> {
  const planilha = montarPayloadPlanilha(parsed);
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'upload_planilha',
    planilha,
  });
  return data;
}

// ─── Item manual ───────────────────────────────────────────────────────────

export async function inserirItemManual(
  payload: ItemManualPayload,
): Promise<{ sucesso: boolean; mensagem: string }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: payload.merchant_id,
    token: payload.token,
    acao: 'item_manual',
    categoria: payload.categoria,
    nome: payload.nome,
    descricao: payload.descricao,
    preco: payload.preco,
    disponivel: payload.disponivel,
    foto_url: payload.foto_url,
    grupos: payload.grupos,
  });
  return data;
}

// ─── Disponibilidade ───────────────────────────────────────────────────────

export async function atualizarDisponibilidade(
  merchantId: string,
  token: string,
  itemId: string,
  disponivel: boolean,
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'disponibilidade',
    item_id: itemId,
    disponivel,
  });
  return data;
}

// ─── Deletar item ──────────────────────────────────────────────────────────

export async function deletarItem(
  merchantId: string,
  token: string,
  itemId: string,
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'deletar_item',
    item_id: itemId,
  });
  return data;
}

// ─── Editar item ──────────────────────────────────────────────────────────

export async function editarItem(
  merchantId: string,
  token: string,
  itemId: string,
  campos: {
    categoria?: string;
    nome?: string;
    descricao?: string;
    preco?: number;
    foto_url?: string;
    disponivel?: boolean;
    grupos?: GrupoEditPayload[];
  },
): Promise<{ sucesso: boolean; mensagem: string }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'editar_item',
    item_id: itemId,
    ...campos,
  });
  return data;
}

// ─── Logo da loja ──────────────────────────────────────────────────────────

export async function atualizarLogo(
  merchantId: string,
  token: string,
  logoUrl: string,
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'atualizar_logo',
    logo_url: logoUrl,
  });
  return data;
}

// ─── Dashboard ────────────────────────────────────────────────────────────

export async function fetchDashboard(
  merchantId: string,
  token: string,
): Promise<{
  total_clientes: number;
  clientes_capturados: number;
  total_pedidos: number;
  pedidos_diretos: number;
  ltv_medio: number;
  total_followups: number;
  total_itens: number;
  itens_ativos: number;
}> {
  const { data } = await api.post('/amx-cardapio-dashboard', {
    merchant_id: merchantId,
    token,
  });
  return data;
}

// ─── Carteira ─────────────────────────────────────────────────────────────

export async function fetchCarteira(
  merchantId: string,
  token: string,
): Promise<{
  indicadores: {
    total_carteira: number;
    total_qr_code: number;
    total_espontaneo: number;
    oportunidades_marketplace: number;
    clientes_ativos: number;
    clientes_em_risco: number;
    clientes_inativos: number;
    ltv_medio: string;
    ltv_total: string;
    ltv_mes_atual: string;
    gap_medio_carteira: number;
    total_convertidos: number;
    total_tentativas: number;
    taxa_conversao: number;
  };
  clientes: {
    id: string;
    nome: string;
    phone: string;
    endereco: string;
    cep: string;
    segmento: string;
    origem: string;
    total_pedidos: number;
    ultimo_pedido: string;
    gap_medio: number | null;
    ltv: string;
    status_cliente: string;
    dias_sem_pedido: number;
    criado_em: string;
  }[];
  evolucao?: {
    data: string;
    qr_code: number;
    espontaneo: number;
    total: number;
  }[];
}> {
  const { data } = await api.post('/amx-cardapio-carteira', {
    merchant_id: merchantId,
    token,
  });
  return data;
}

// ─── Status da loja ───────────────────────────────────────────────────────

export async function toggleLojaAberta(
  merchantId: string,
  token: string,
  lojaAberta: boolean,
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'toggle_loja',
    loja_aberta: lojaAberta,
  });
  return data;
}

export async function atualizarMensagemFechado(
  merchantId: string,
  token: string,
  mensagemFechado: string,
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'atualizar_mensagem_fechado',
    mensagem_fechado: mensagemFechado,
  });
  return data;
}

// ─── Horários ─────────────────────────────────────────────────────────────

export async function atualizarHorarios(
  merchantId: string,
  token: string,
  horarios: Record<string, { aberto: boolean; abertura: string; fechamento: string }>,
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'atualizar_horarios',
    horarios,
  });
  return data;
}

export async function reordenarItens(
  merchantId: string,
  token: string,
  itens: { id: string; ordem: number }[],
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'reordenar_itens',
    itens,
  });
  return data;
}

// ─── Pedidos ──────────────────────────────────────────────────────────────

export async function fetchPedidos(
  merchantId: string,
  token: string,
): Promise<{
  indicadores: {
    total_pedidos: number;
    total_ifood: number;
    total_direto: number;
    valor_total: string;
    valor_ifood: string;
    valor_direto: string;
    ticket_medio: string;
  };
  pedidos: {
    id: string;
    canal: string;
    status: string;
    total: string;
    criado_em: string;
    atualizado_em: string;
    cliente_nome: string;
    cliente_phone: string | null;
    forma_pagamento: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento: string;
      cidade: string;
    };
    itens: {
      nome: string;
      preco: number;
      quantidade: number;
    }[];
  }[];
}> {
  const { data } = await api.post('/amx-cardapio-pedidos', {
    merchant_id: merchantId,
    token,
  });
  return data;
}

// ─── Operador multi-loja ──────────────────────────────────────────────────

export async function validarOperador(clerkUserId: string): Promise<{
  sucesso: boolean;
  operador?: { id: string; nome: string; email: string };
  lojas?: {
    merchant_id: string;
    nome: string;
    slug: string;
    logo_url: string | null;
    loja_aberta: boolean;
    cardapio_ativo: boolean;
    token_admin: string;
  }[];
  erro?: string;
}> {
  const { data } = await api.post('/amx-operador-lojas', {
    clerk_user_id: clerkUserId,
  });
  return data;
}

// ─── Club VIP ─────────────────────────────────────────────────────────────

export async function buscarClubVipDashboard(
  merchantId: string,
  token: string,
): Promise<{
  sucesso: boolean;
  config: ClubVipConfig;
  niveis: ClubVipNivel[];
  saldos: ClubVipSaldo[];
  resgates: ClubVipResgate[];
}> {
  const { data } = await api.post('/amx-clubvip-dashboard', {
    merchant_id: merchantId,
    token,
  });
  return data;
}

export async function configurarClubVip(
  merchantId: string,
  token: string,
  acao: string,
  payload: object,
): Promise<{ sucesso: boolean; mensagem?: string; nivel?: ClubVipNivel; erro?: string }> {
  const { data } = await api.post('/amx-clubvip-configurar', {
    merchant_id: merchantId,
    token,
    acao,
    ...payload,
  });
  return data;
}

export async function registrarIntencaoClubVip(
  phone: string,
  merchantId: string,
  nivelId: string | null,
  decisao: 'resgatar' | 'acumular',
): Promise<{ sucesso: true }> {
  const { data } = await api.post('/amx-clubvip-intencao', {
    phone,
    merchant_id: merchantId,
    nivel_id: nivelId,
    decisao,
  });
  return data;
}

export async function buscarSaldoClubVip(
  merchantId: string,
  phone: string,
): Promise<{
  sucesso: boolean;
  club_ativo: boolean;
  pontos_atuais?: number;
  pontos_por_compra?: number;
  proximo_nivel?: { meta_pontos: number; brinde: string; faltam?: number };
  endereco?: EnderecoCliente | null;
  resgate_disponivel?: boolean;
  nivel_resgatavel?: { id: string; meta_pontos: number; brinde: string } | null;
  nivel_maximo_atingido?: boolean;
}> {
  const { data } = await api.post('/amx-clubvip-saldo', {
    merchant_id: merchantId,
    phone,
  });
  return data;
}

// ─── Geocodificação e distância (via n8n → Nominatim/OpenStreetMap) ────────

export async function geocodificarEndereco(
  merchantId: string,
  token: string,
  endereco: string,
): Promise<{ sucesso: true; lat: number; lng: number; endereco_formatado: string } | { sucesso: false; erro: string }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'geocodificar_endereco',
    endereco,
  });
  return data;
}

export async function calcularDistancia(
  merchantId: string,
  latOrigem: number,
  lngOrigem: number,
  enderecoDestino: string,
): Promise<{ sucesso: true; distancia_km: number; distancia_texto: string } | { sucesso: false; erro: string }> {
  const { data } = await api.post('/amx-calcular-distancia', {
    merchant_id: merchantId,
    lat_origem: latOrigem,
    lng_origem: lngOrigem,
    endereco_destino: enderecoDestino,
  });
  return data;
}

// ─── Taxa de entrega ──────────────────────────────────────────────────────

export async function salvarTaxaEntrega(
  merchantId: string,
  token: string,
  payload: {
    taxa_entrega_tipo: string;
    taxa_entrega_valor: number;
    pedido_minimo: number;
    lat: number | null;
    lng: number | null;
  },
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'salvar_taxa_entrega',
    ...payload,
  });
  return data;
}

// ─── Categorias ───────────────────────────────────────────────────────────

// TODO (n8n M3): acao 'buscar_categorias' → SELECT nome, ordem FROM menu_categorias WHERE merchant_id ORDER BY ordem ASC
export async function buscarCategorias(
  merchantId: string,
  token: string,
): Promise<{ sucesso: boolean; categorias: CategoriaOrdem[] }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'buscar_categorias',
  });
  return data;
}

// TODO (n8n M3): acao 'reordenar_categorias' → UPDATE menu_categorias SET ordem usando jsonb_to_recordset
export async function reordenarCategorias(
  merchantId: string,
  token: string,
  categorias: CategoriaOrdem[],
): Promise<{ sucesso: boolean }> {
  const { data } = await api.post('/amx-cardapio-admin', {
    merchant_id: merchantId,
    token,
    acao: 'reordenar_categorias',
    categorias,
  });
  return data;
}

// ─── Chat ─────────────────────────────────────────────────────────────────

export async function fetchChat(
  merchantId: string,
  token: string,
): Promise<{
  conversas: {
    session_id: string;
    nome: string;
    origem: string;
    total_mensagens: number;
    ultima_mensagem: string;
    ultimo_tipo: string;
    mensagens: {
      id: number;
      tipo: string;
      conteudo: string;
    }[];
  }[];
}> {
  const { data } = await api.post('/amx-cardapio-chat', {
    merchant_id: merchantId,
    token,
  });
  return data;
}