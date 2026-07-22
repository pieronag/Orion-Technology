'use client';

import { useState, useEffect } from 'react';
import { getNexusDashboardStats } from '@/app/actions/nexus/dashboard';
import { BarChart3, Clock, TrendingUp, Wrench } from 'lucide-react';
import { EQUIPMENT_TYPES, WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNexusDashboardStats().then(r => {
      if (r.success) setStats(r.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reportes...</div>;
  if (!stats) return null;

  const avgByType = stats.avgRepairTimeByType || {};

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
        <BarChart3 size={22} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} /> Reportes
      </h1>

      <div className="bento-grid">
        {/* Average repair time */}
        <div className="bento-col-5">
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={16} /> Tiempo promedio de reparación
            </h3>
            {stats.avgRepairTime > 0 ? (
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                {Math.round(stats.avgRepairTime / 3600000)}h
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '0.5rem' }}>
                  ({(stats.avgRepairTime / 86400000).toFixed(1)} días)
                </span>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin datos suficientes para calcular</p>
            )}

            <div style={{ marginTop: '0.8rem' }}>
              <h4 style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>Por tipo de equipo</h4>
              {Object.entries(avgByType).length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sin datos</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {Object.entries(avgByType).map(([type, time]) => {
                    const label = EQUIPMENT_TYPES.find(t => t.id === type)?.label || type;
                    const hours = Math.round((time as number) / 3600000);
                    return (
                      <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.2rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ fontWeight: 600 }}>{label}</span>
                        <span style={{ fontWeight: 700 }}>{hours}h</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders by status */}
        <div className="bento-col-7">
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <TrendingUp size={16} /> Distribución de órdenes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {WORK_ORDER_STATUSES.map(s => {
                const count = stats.statusCounts?.[s.id] || 0;
                const total = stats.totalOrders || 1;
                const pct = (count / total * 100).toFixed(1);
                return (
                  <div key={s.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-accent)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '3px', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
