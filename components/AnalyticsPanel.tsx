'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Eye, CheckCircle2, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

type Proposal = {
  id: string; title: string; clientName: string; status: string; tags: string[];
  createdAt: number; expiresAt: number;
};

function Bar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ width: '80px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '22px', background: 'var(--bg-accent)', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.6s ease', minWidth: value > 0 ? '18px' : '0' }} />
      </div>
      <span style={{ width: '40px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function AnalyticsPanel({ proposals }: { proposals: Proposal[] }) {
  const [open, setOpen] = useState(false);
  const now = Date.now();
  const total = proposals.length;
  const sent = proposals.filter(p => p.status === 'sent' && now <= p.expiresAt).length;
  const viewed = proposals.filter(p => p.status === 'viewed').length;
  const accepted = proposals.filter(p => p.status === 'accepted').length;
  const expired = proposals.filter(p => now > p.expiresAt).length;
  const max = Math.max(sent, viewed, accepted, expired, 1);

  const months = [...new Set(proposals.map(p => {
    const d = new Date(p.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].sort();
  const monthCounts = months.map(m => ({
    month: m,
    count: proposals.filter(p => {
      const d = new Date(p.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m;
    }).length,
  }));
  const maxMonth = Math.max(...monthCounts.map(m => m.count), 1);

  const monthLabels: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--primary)" />
          <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>Analíticas</span>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {open && (
        <div style={{ marginTop: '1rem' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Totales', value: total, icon: BarChart3, color: 'var(--primary)' },
              { label: 'Enviadas', value: sent, icon: Clock, color: '#3b82f6' },
              { label: 'Vistas', value: viewed, icon: Eye, color: '#10b981' },
              { label: 'Aceptadas', value: accepted, icon: CheckCircle2, color: '#7c3aed' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: 'var(--bg-accent)', padding: '0.8rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{stat.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Status bars */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribución por Estado</div>
            <Bar value={sent} max={max} label="Enviadas" color="#3b82f6" />
            <Bar value={viewed} max={max} label="Vistas" color="#10b981" />
            <Bar value={accepted} max={max} label="Aceptadas" color="#7c3aed" />
            <Bar value={expired} max={max} label="Expiradas" color="#ef4444" />
          </div>

          {/* Monthly bars */}
          {monthCounts.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Propuestas por Mes</div>
              {monthCounts.map((m) => {
                const [year, month] = m.month.split('-');
                const label = `${monthLabels[month] || month} ${year.slice(2)}`;
                return (
                  <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ width: '70px', fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: '16px', background: 'var(--bg-accent)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(m.count / maxMonth) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px', transition: 'width 0.6s ease', minWidth: m.count > 0 ? '14px' : '0' }} />
                    </div>
                    <span style={{ width: '30px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text)', textAlign: 'right' }}>{m.count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rate */}
          {viewed + accepted > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tasa de vista: </span>
                <span style={{ fontWeight: '800' }}>{total > 0 ? Math.round((viewed / total) * 100) : 0}%</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tasa de aceptación: </span>
                <span style={{ fontWeight: '800' }}>{total > 0 ? Math.round((accepted / total) * 100) : 0}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
