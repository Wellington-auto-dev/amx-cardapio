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