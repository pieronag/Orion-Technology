'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNexusDashboardStats } from '@/app/actions/nexus/dashboard';
import Link from 'next/link';
import { WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';
import { Users, Monitor, ClipboardList, DollarSign, AlertTriangle, Wrench, Clock, TrendingUp, FileText, ArrowUpRight, ShoppingCart, CreditCard, Receipt, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MonthYearFilter from '@/components/nexus/MonthYearFilter';

export default function NexusDashboard() {
  const nowDate = new Date();
  const [filterMonth, setFilterMonth] = useState(nowDate.getMonth());
  const [filterYear, setFilterYear] = useState(nowDate.getFullYear());
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    const result = await getNexusDashboardStats(filterMonth, filterYear);
    if (result.success) setStats(result.stats);
    setLoading(false);
  }, [filterMonth, filterYear]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const handleFilterChange = (month: number, year: number) => {
    setFilterMonth(month);
    setFilterYear(year);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const statusCounts: Record<string, number> = stats?.statusCounts || {};
  const totalOrders = stats?.totalOrders || 0;
  const statusesWithCount = WORK_ORDER_STATUSES.map(s => ({ ...s, count: statusCounts[s.id] || 0 }));
  const lowStock = stats?.lowStockItems || [];

  const totalCards = [
    { label: 'En taller', suffix: '', value: stats?.inWorkshop || 0, icon: Wrench, color: '#f59e0b' },
    { label: 'Clientes', suffix: '', value: stats?.totalClients || 0, icon: Users, color: '#3b82f6' },
    { label: 'Equipos', suffix: '', value: stats?.totalEquipments || 0, icon: Monitor, color: '#0891b2' },
    { label: 'Facturación total', suffix: '', value: `$${(stats?.totalRevenue || 0).toLocaleString('es-CL')}`, icon: Receipt, color: '#6b7280' },
  ];

  const monthCards = [
    { label: 'Órdenes', suffix: 'del mes', value: stats?.monthOrders || 0, icon: ClipboardList, color: '#7c3aed' },
    { label: 'Cotizaciones', suffix: 'del mes', value: stats?.monthQuotes || 0, icon: FileText, color: '#8b5cf6' },
    { label: 'Ingresos', suffix: 'del mes', value: `$${(stats?.monthPayments || 0).toLocaleString('es-CL')}`, icon: DollarSign, color: '#10b981' },
    { label: 'Pendiente cobro', suffix: 'del mes', value: `$${(stats?.pendingRevenue || 0).toLocaleString('es-CL')}`, icon: Clock, color: '#ef4444' },
  ];

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) { .dash-header { flex-direction: column !important; align-items: stretch !important; gap: 0.75rem !important; } .dash-actions { flex-direction: column !important; align-items: stretch !important; gap: 0.5rem !important; width: 100% !important; } .dash-actions .btn { width: 100% !important; text-align: center !important; font-size: 0.82rem !important; padding: 0.55rem 1rem !important; } .dash-actions > div { width: 100% !important; justify-content: center !important; } .dash-kpi-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}></span>
            Nexus
          </h1>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>Panel de servicio técnico</p>
        </div>
        <div className="dash-actions" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link href="/nexus/work-orders/new" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1.1rem' }}><PlusCircle size={16} /> Nueva orden</Link>
          <div><MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={handleFilterChange} /></div>
        </div>
      </div>

      {/* Totals row */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Totales generales</div>
      <div className="bento-grid dash-kpi-grid" style={{ marginBottom: '1rem' }}>
        {totalCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bento-col-3" style={{ animation: `fade-up 0.4s ease ${i * 0.05}s both` }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.8rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${card.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly row */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
        {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][filterMonth]} {filterYear}
      </div>
      <div className="bento-grid dash-kpi-grid" style={{ marginBottom: '1.2rem' }}>
        {monthCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bento-col-3" style={{ animation: `fade-up 0.4s ease ${i * 0.05}s both` }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.8rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${card.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label} <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{card.suffix}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bento-grid">
        {/* Left: Status + Payments + Avg Time */}
        <div className="bento-col-5">
          {/* Status bars */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Distribución de órdenes</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {statusesWithCount.filter(s => s.count > 0 || s.id === 'received' || s.id === 'delivered').map(s => (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.12rem' }}>
                    <span style={{ fontWeight: 600, color: s.count > 0 ? 'var(--text)' : 'var(--text-muted)' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--bg-accent)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalOrders > 0 ? (s.count / totalOrders * 100) : 0}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`, borderRadius: '3px', transition: 'width 0.6s' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment stats */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <CreditCard size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Estado de pagos</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { label: 'Pendiente', value: stats?.pendingPaymentCount || 0, color: '#ef4444' },
                { label: 'Parcial', value: stats?.partialPaymentCount || 0, color: '#f59e0b' },
                { label: 'Pagado', value: stats?.paidCount || 0, color: '#10b981' },
                { label: 'Total', value: totalOrders, color: '#6b7280' },
              ].map(p => (
                <div key={p.label} style={{ flex: 1, textAlign: 'center', padding: '0.4rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: p.color }}>{p.value}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Average repair time */}
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <Clock size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Tiempo promedio de reparación</span>
            </div>
            {stats?.avgRepairTime > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {Math.round(stats.avgRepairTime / 3600000)}h
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ({(stats.avgRepairTime / 86400000).toFixed(1)} días)
                </span>
                {Object.entries(stats.avgRepairTimeByType || {}).length > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {Object.entries(stats.avgRepairTimeByType).map(([type, time]) => (
                      <span key={type} style={{ marginRight: '0.3rem' }}>
                        {type}: {Math.round((time as number) / 3600000)}h
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sin datos suficientes</span>
            )}
          </div>

          {/* Low stock alerts */}
          {lowStock.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>Stock bajo ({lowStock.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {lowStock.slice(0, 5).map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.15rem 0' }}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: item.stock === 0 ? '#ef4444' : '#f59e0b' }}>{item.stock}/{item.minStock}</span>
                  </div>
                ))}
              </div>
              <Link href="/nexus/inventory" style={{ display: 'block', textAlign: 'center', marginTop: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>Ir al inventario →</Link>
            </div>
          )}
        </div>

        {/* Right: Recent activity */}
        <div className="bento-col-7">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Actividad reciente</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
              {(stats?.recentActivity || []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.5rem 0' }}>Sin actividad aún</p>
              ) : (
                (stats?.recentActivity || []).map((act: any) => {
                  const statusDef = WORK_ORDER_STATUSES.find(s => s.id === act.status);
                  return (
                    <Link key={act.id} href={`/nexus/work-orders/${act.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: '8px', textDecoration: 'none', color: 'var(--text)', transition: 'background 0.15s' }} className="hover:bg-[rgba(0,0,0,0.02)]">
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusDef?.color || '#888', flexShrink: 0 }}></span>
                      <div style={{ flex: 1, minWidth: 0, fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600 }}>{statusDef?.label || act.status}</span>
                        {act.equipmentName && <span style={{ color: 'var(--text-muted)' }}> — {act.equipmentName}</span>}
                        {act.clientName && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> · {act.clientName}</span>}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', flexShrink: 0 }}>{format(act.createdAt, 'd MMM HH:mm', { locale: es })}</span>
                      <ArrowUpRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
