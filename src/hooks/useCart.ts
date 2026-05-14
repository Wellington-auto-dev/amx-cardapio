import { useState, useCallback, useMemo } from 'react';
import type { CartItem, OpcaoSelecionada } from '@/types/cart';
import type { Item } from '@/types/catalog';
import { toMoney } from '@/utils/formatCurrency';

let cartItemCounter = 0;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + toMoney(item.preco_unitario) * toMoney(item.quantidade), 0),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantidade, 0),
    [items],
  );

  const addItem = useCallback(
    (
      catalogItem: Item,
      quantidade: number,
      opcoesSelecionadas: OpcaoSelecionada[],
      categoriaNome: string,
    ) => {
      const adicionais = opcoesSelecionadas.reduce((s, o) => s + toMoney(o.preco_adicional ?? 0), 0);
      const precoUnitario = toMoney(catalogItem.preco) + adicionais;

      const newItem: CartItem = {
        cart_item_id: `ci-${++cartItemCounter}`,
        item_id: catalogItem.id,
        nome: catalogItem.nome,
        preco_base: catalogItem.preco,
        foto_url: catalogItem.foto_url,
        categoria_nome: categoriaNome,
        quantidade,
        opcoes_selecionadas: opcoesSelecionadas,
        preco_unitario: precoUnitario,
      };

      setItems((prev) => [...prev, newItem]);
    },
    [],
  );

  const replaceItem = useCallback((
    cartItemId: string,
    catalogItem: Item,
    quantidade: number,
    opcoesSelecionadas: OpcaoSelecionada[],
  ) => {
    const adicionais = opcoesSelecionadas.reduce((s, o) => s + toMoney(o.preco_adicional ?? 0), 0);
    const precoUnitario = toMoney(catalogItem.preco) + adicionais;
    setItems((prev) =>
      prev.map((i) =>
        i.cart_item_id !== cartItemId
          ? i
          : { ...i, quantidade, opcoes_selecionadas: opcoesSelecionadas, preco_unitario: precoUnitario },
      ),
    );
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantidade: number) => {
    if (quantidade <= 0) {
      setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.cart_item_id === cartItemId ? { ...i, quantidade } : i,
        ),
      );
    }
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return { items, total, totalItems, addItem, replaceItem, updateQuantity, removeItem, clearCart };
}
