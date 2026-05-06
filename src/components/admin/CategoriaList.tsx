import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Categoria } from '@/types/catalog';
import type { AdminSession } from '@/types/admin';
import { reordenarCategorias } from '@/services/api';

interface CategoriaListProps {
  categorias: Categoria[];
  session: AdminSession;
  onToast: (type: 'success' | 'error', title: string, msg?: string) => void;
}

function SortableCategoria({ nome }: { nome: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: nome });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-3 px-4 py-3"
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: isDragging ? 'var(--color-surface-2)' : undefined,
        position: 'relative',
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="opacity-25 hover:opacity-70 transition-opacity shrink-0"
        style={{
          color: 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          padding: 2,
          touchAction: 'none',
        }}
        aria-label={`Arrastar categoria ${nome}`}
      >
        <svg viewBox="0 0 10 16" fill="currentColor" className="w-2.5 h-4">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="6" r="1.5" />
          <circle cx="8" cy="6" r="1.5" />
          <circle cx="2" cy="10" r="1.5" />
          <circle cx="8" cy="10" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </button>
      <span className="text-sm font-600 flex-1" style={{ color: 'var(--color-text)' }}>{nome}</span>
    </div>
  );
}

export function CategoriaList({ categorias, session, onToast }: CategoriaListProps) {
  const [nomes, setNomes] = useState<string[]>(() => categorias.map((c) => c.nome));

  useEffect(() => {
    setNomes(categorias.map((c) => c.nome));
  }, [categorias]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = nomes.indexOf(String(active.id));
    const newIdx = nomes.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;

    const newNomes = arrayMove(nomes, oldIdx, newIdx);
    setNomes(newNomes);

    const payload = newNomes.map((nome, i) => ({ nome, ordem: i }));
    reordenarCategorias(session.merchant_id, session.token, payload)
      .then(() => onToast('success', 'Ordem das categorias atualizada!'))
      .catch(() => onToast('error', 'Erro ao salvar ordem das categorias'));
  };

  if (nomes.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={nomes} strategy={verticalListSortingStrategy}>
          {nomes.map((nome) => (
            <SortableCategoria key={nome} nome={nome} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
