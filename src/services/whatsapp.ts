import type { CartItem } from '@/types/cart';
import type { EnderecoCliente } from '@/types/catalog';
import { formatCurrency, toMoney } from '@/utils/formatCurrency';
import { formatWhatsappMessage } from '@/utils/formatWhatsappMessage';

const WA_BASE = import.meta.env.VITE_WHATSAPP_BASE_URL as string;

interface DeliveryInfo {
  endereco: EnderecoCliente | null;
  taxaEntregaTipo: string;
  taxaEntregaValor: number;
}

export function abrirWhatsApp(
  whatsappNumero: string,
  items: CartItem[],
  subtotal: number,
  delivery?: DeliveryInfo,
): void {
  const linhas = items.map((item) => {
    const opcoesStr = item.opcoes_selecionadas
      .map((o) => o.opcao_nome)
      .join(', ');
    const descricao = opcoesStr ? ` (${opcoesStr})` : '';
    return `- ${item.nome}${descricao} x${item.quantidade} -- ${formatCurrency(toMoney(item.preco_unitario) * toMoney(item.quantidade))}`;
  });

  const mensagem = formatWhatsappMessage(linhas, subtotal, delivery);
  const url = `${WA_BASE}/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}
