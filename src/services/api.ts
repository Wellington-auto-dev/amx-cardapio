import axios from 'axios';
import type { Merchant } from '@/types/catalog';
import type { ItemManualPayload } from '@/types/admin';
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