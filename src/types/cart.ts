// Tipos do carrinho de compras

export interface OpcaoSelecionada {
  grupo_id: string;
  grupo_nome: string;
  opcao_id: string;
  opcao_nome: string;
  preco_adicional: number;
}

export interface CartItem {
  /** UUID gerado no momento da adição — permite duplicatas do mesmo item */
  cart_item_id: string;
  item_id: string;
  nome: string;
  preco_base: number;
  foto_url: string;
  categoria_nome: string;
  quantidade: number;
  opcoes_selecionadas: OpcaoSelecionada[];
  /** Preço unitário já calculado com adicionais */
  preco_unitario: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
