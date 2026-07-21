'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';
import { setProposalStatus } from '@/app/actions/proposals';
import { ExternalLink, Clock, Eye, CheckCircle2 } from 'lucide-react';
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
  const isExpired = Date.now() > proposal.expiresAt;
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 100, opacity: 0.9 } : {};

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{
      ...style, background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--glass-border)', cursor: 'grab', opacity: isExpired ? 0.5 : 1,
    }}>
      <div style={{ fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.15rem' }}>{proposal.clientName}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{proposal.title}</div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{format(proposal.createdAt, 'd MMM', { locale: es })}</div>
      <Link href={`/p/${proposal.id}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--secondary)', fontSize: '0.65rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
        <ExternalLink size={11} /> Ver
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
      borderRadius: 'var(--radius-md)', padding: '0.6rem',
      border: `1px solid ${isOver ? 'var(--primary)' : 'var(--glass-border)'}`,
      transition: 'border-color 0.15s', minHeight: '150px',
      display: 'flex', flexDirection: 'column', gap: '0.4rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Icon size={15} color={column.color} />
        <span style={{ fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: column.color }}>{column.label}</span>
        <span style={{ marginLeft: 'auto', background: column.bg, color: column.color, padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '700' }}>{proposals.length}</span>
      </div>
      {proposals.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Arrastra aquí</div>}
      {proposals.map((p) => <DraggableCard key={p.id} proposal={p} />)}
    </div>
  );
}

export default function KanbanBoard({ proposals }: { proposals: Proposal[] }) {
  const [localProposals, setLocalProposals] = useState<Proposal[]>(proposals);

  useEffect(() => {
    setLocalProposals(proposals);
  }, [proposals]);

  const now = Date.now();
  const columnKeys = ['sent', 'viewed', 'accepted', 'expired'];

  const grouped = columns.map((col) => {
    if (col.key === 'expired') return { ...col, proposals: localProposals.filter(p => now > p.expiresAt) };
    return { ...col, proposals: localProposals.filter(p => p.status === col.key && now <= p.expiresAt) };
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const targetStatus = over.id as string;
    if (!columnKeys.includes(targetStatus) || targetStatus === 'expired') return;

    const activeStatus = active.data.current?.status;
    if (activeStatus === targetStatus) return;

    // Optimistic update
    setLocalProposals((prev) =>
      prev.map((p) => (p.id === active.id ? { ...p, status: targetStatus } : p))
    );

    await setProposalStatus(active.id as string, targetStatus);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', alignItems: 'start' }}>
        {grouped.map((col) => (
          <Column key={col.key} column={col} proposals={col.proposals} />
        ))}
      </div>
    </DndContext>
  );
}
