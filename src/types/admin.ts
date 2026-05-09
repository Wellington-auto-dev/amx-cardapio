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

export interface OpcaoEditPayload {
  id?: string;
  nome: string;
  preco_adicional: number;
}

export interface GrupoEditPayload {
  id?: string;
  nome: string;
  obrigatorio: boolean;
  minimo: number;
  maximo: number;
  opcoes: OpcaoEditPayload[];
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

// Club VIP
export interface ClubVipConfig {
  ativo: boolean;
  valor_minimo: number;
  pontos_por_compra: number;
}

export interface ClubVipNivel {
  id: string;
  meta_pontos: number;
  brinde: string;
  ativo: boolean;
  criado_em: string;
}

export interface ClubVipSaldo {
  nome: string;
  phone: string;
  pontos: number;
  total_resgatado: number;
}

export interface ClubVipResgate {
  id: string;
  cliente_nome: string;
  cliente_phone: string;
  brinde: string;
  utilizado: boolean;
  criado_em: string;
}

export interface CategoriaOrdem {
  nome: string;
  ordem: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
