import type { CartItem } from '@/types/cart';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatWhatsappMessage } from '@/utils/formatWhatsappMessage';

const WA_BASE = import.meta.env.VITE_WHATSAPP_BASE_URL as string;

export function abrirWhatsApp(
  whatsappNumero: string,
  items: CartItem[],
  total: number,
): void {
  const linhas = items.map((item) => {
    const opcoesStr = item.opcoes_selecionadas
      .map((o) => o.opcao_nome)
      .join(', ');
    const descricao = opcoesStr ? ` (${opcoesStr})` : '';
    return `- ${item.nome}${descricao} x${item.quantidade} -- ${formatCurrency(item.preco_unitario * item.quantidade)}`;
  });

  const mensagem = formatWhatsappMessage(linhas, total);
  const url = `${WA_BASE}/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}