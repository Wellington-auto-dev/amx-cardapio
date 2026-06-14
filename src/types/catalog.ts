// Tipos do cardápio público

export interface EnderecoCliente {
  cep: string | null;
  endereco_logradouro: string | null;
  endereco_numero: string | null;
  endereco_complemento: string | null;
  cidade: string | null;
}

export interface OpcaoGrupo {
  id: string;
  nome: string;
  preco_adicional: number;
}

export interface GrupoItem {
  id: string;
  nome: string;
  obrigatorio: boolean;
  minimo: number;
  maximo: number;
  opcoes: OpcaoGrupo[];
}

export interface Item {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto_url: string;
  disponivel: boolean;
  grupos: GrupoItem[];
}

export interface Categoria {
  nome: string;
  itens: Item[];
}

export interface Merchant {
  merchant_id: string;
  nome_loja: string;
  logo_url: string;
  whatsapp_numero: string;
  loja_aberta: boolean;
  mensagem_fechado: string;
  taxa_entrega_tipo: string;
  taxa_entrega_valor: number;
  pedido_minimo: number;
  lat: number | null;
  lng: number | null;
  horarios?: {
    segunda: { aberto: boolean; abertura: string; fechamento: string };
    terca: { aberto: boolean; abertura: string; fechamento: string };
    quarta: { aberto: boolean; abertura: string; fechamento: string };
    quinta: { aberto: boolean; abertura: string; fechamento: string };
    sexta: { aberto: boolean; abertura: string; fechamento: string };
    sabado: { aberto: boolean; abertura: string; fechamento: string };
    domingo: { aberto: boolean; abertura: string; fechamento: string };
  };
  categorias: Categoria[];
  stripe_ativo: boolean;
  stripe_public_key: string | null;
  pagamento_online: boolean;
  pagamento_na_entrega: boolean;
}
