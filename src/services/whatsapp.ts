import type { CartItem } from '@/types/cart';
import type { EnderecoCliente } from '@/types/catalog';
import { formatCurrency, toMoney } from '@/utils/formatCurrency';
import { formatWhatsappMessage } from '@/utils/formatWhatsappMessage';

const WA_BASE = import.meta.env.VITE_WHATSAPP_BASE_URL as string;

interface DeliveryInfo {
  endereco: EnderecoCliente | null;
  taxaEntregaTipo: string;
  taxaEntregaValor: number;
  taxaKmCalculada?: number | null;
  distanciaKm?: number | null;
}

interface ResgateInfo {
  nivelId: string;
  brinde: string;
}

export function abrirWhatsApp(
  whatsappNumero: string,
  items: CartItem[],
  subtotal: number,
  delivery?: DeliveryInfo,
  resgateInfo?: ResgateInfo | null,
  paymentStatus?: 'online' | null,
): void {
  const linhas = items.map((item) => {
    const opcoesStr = item.opcoes_selecionadas
      .map((o) => o.opcao_nome)
      .join(', ');
    const descricao = opcoesStr ? ` (${opcoesStr})` : '';
    return `- ${item.nome}${descricao} x${item.quantidade} -- ${formatCurrency(toMoney(item.preco_unitario) * toMoney(item.quantidade))}`;
  });

  const mensagem = formatWhatsappMessage(linhas, subtotal, delivery, resgateInfo, paymentStatus);
  const url = `${WA_BASE}/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
  const win = window.open(url, '_blank');
  // Fallback para quando window.open é bloqueado pelo browser (ex: após await em iOS/mobile)
  if (!win) window.location.href = url;
}
