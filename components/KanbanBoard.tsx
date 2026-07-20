'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable, closestCorners, DragOverEvent } from '@dnd-kit/core';
import { setProposalStatus } from '@/app/actions/proposals';
import { useRouter } from 'next/navigation';
import { ExternalLink, Clock, Eye, CheckCircle2, Tag } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Proposal = {
  id: string; title: string; clientName: string; status: string; tags: string[];
  createdAt: number; expiresAt: number;
};

const columns = [
  { key: 'sent', label: 'Enviadas', icon: Clock, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  { key: 'viewed', label: 'Vistas', icon: Eye, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  { key: 'accepted', label: 'Aceptadas', icon: CheckCircle2, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
  { key: 'expired', label: 'Expiradas', icon: Clock, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
];

function DraggableCard({ proposal }: { proposal: Proposal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: proposal.id, data: { status: proposal.status } });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 100, opacity: 0.9 } : {};
  const isExpired = Date.now() > proposal.expiresAt;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{
      ...style, background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--glass-border)', cursor: 'grab', transition: 'box-shadow 0.2s',
      boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : 'none', opacity: isExpired ? 0.6 : 1,
    }}>
      <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{proposal.clientName}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>{proposal.title}</div>
      {(proposal.tags || []).length > 0 && (
        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          {proposal.tags.map((t: string) => (
            <span key={t} style={{ padding: '0.1rem 0.3rem', background: 'var(--primary-glow)', borderRadius: '999px', fontSize: '0.55rem', fontWeight: '700', color: 'var(--primary)' }}>{t}</span>
          ))}
        </div>
      )}
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        {format(proposal.createdAt, 'd MMM', { locale: es })}
      </div>
      <Link href={`/p/${proposal.id}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--secondary)', fontSize: '0.7rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.3rem' }}>
        <ExternalLink size={12} /> Ver
      </Link>
    </div>
  );
}

function Column({ column, proposals }: { column: typeof columns[0]; proposals: Proposal[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.key });
  const Icon = column.icon;

  return (
    <div ref={setNodeRef} style={{
      background: isOver ? 'rgba(124,58,237,0.03)' : 'var(--bg-accent)',
      borderRadius: 'var(--radius-lg)', padding: '0.8rem',
      border: `1px solid ${isOver ? 'var(--primary)' : 'var(--glass-border)'}`,
      transition: 'border-color 0.2s, background 0.2s',
      display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '200px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
        <Icon size={16} color={column.color} />
        <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: column.color }}>{column.label}</span>
        <span style={{ marginLeft: 'auto', background: column.bg, color: column.color, padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700' }}>{proposals.length}</span>
      </div>
      {proposals.length === 0 && (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Arrastra propuestas aquí</div>
      )}
      {proposals.map((p) => <DraggableCard key={p.id} proposal={p} />)}
    </div>
  );
}

export default function KanbanBoard({ proposals }: { proposals: Proposal[] }) {
  const router = useRouter();
  const now = Date.now();

  const grouped = columns.map((col) => {
    if (col.key === 'expired') return { ...col, proposals: proposals.filter(p => now > p.expiresAt) };
    return { ...col, proposals: proposals.filter(p => p.status === col.key && now <= p.expiresAt) };
  });

  const columnKeys = ['sent', 'viewed', 'accepted', 'expired'];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Solo procesar si se soltó sobre una columna (no sobre otra tarjeta)
    const targetStatus = over.id as string;
    if (!columnKeys.includes(targetStatus)) return;

    if (targetStatus === 'expired') return;

    const activeStatus = active.data.current?.status;
    if (activeStatus !== targetStatus) {
      await setProposalStatus(active.id as string, targetStatus);
      router.refresh();
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', alignItems: 'start' }}>
        {grouped.map((col) => (
          <Column key={col.key} column={col} proposals={col.proposals} />
        ))}
      </div>
      <style>{`@media (max-width: 1000px) { .kanban-grid { grid-template-columns: repeat(2, 1fr); } }`}</style>
    </DndContext>
  );
}
