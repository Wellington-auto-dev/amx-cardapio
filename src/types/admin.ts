// Tipos do painel administrativo

export interface AdminSession {
  merchant_id: string;
  merchant_slug: string;
  token: string;
}

// Payload para inserção manual de item
export interface OpcaoManualPayload {
  nome: string;
  preco_adicional: number;
}

export interface GrupoManualPayload {
  nome: string;
  obrigatorio: boolean;
  minimo: number;
  maximo: number;
  opcoes: OpcaoManualPayload[];
}

export interface ItemManualPayload {
  merchant_id: string;
  token: string;
  categoria: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  foto_url: string;
  grupos: GrupoManualPayload[];
}

// Linha da planilha Excel após parse
export interface PlanilhaItemRow {
  categoria: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: string;
}

export interface PlanilhaGrupoRow {
  item_nome: string;
  grupo_nome: string;
  obrigatorio: string;
  opcao_nome: string;
  preco_adicional: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
