'use client';

import { useState, useEffect } from 'react';
import { getWorkOrders, updateWorkOrderStatus, WorkOrderData } from '@/app/actions/nexus/work-orders';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import Link from 'next/link';
import { ClipboardList, Plus, Search, Wrench, DollarSign, Clock, CheckCircle2, PlusCircle } from 'lucide-react';
import { WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';
import MonthYearFilter, { monthYearFilter } from '@/components/nexus/MonthYearFilter';

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrderData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const load = async () => {
    const [or, cr, er] = await Promise.all([getWorkOrders(), getClients(), getEquipments()]);
    if (or.success && or.orders) setOrders(or.orders);
    if (cr.success && cr.clients) setClients(cr.clients);
    if (er.success && er.equipments) setEquipments(er.equipments);
    setLoading(false);
  };

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const equipMap = new Map(equipments.map(e => [e.id, e]));

  const filteredOrders = monthYearFilter(orders, filterMonth, filterYear);

  const activeOrders = filteredOrders.filter(o => o.status !== 'delivered');
  const totalPending = filteredOrders.filter(o => o.status !== 'delivered' && o.paymentStatus === 'pending').length;
  const totalPaid = filteredOrders.filter(o => o.paymentStatus === 'paid').length;
  const activeFiltered = filteredOrders.filter(o => o.status !== 'cancelled');
  const totalRevenue = activeFiltered.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingRevenue = activeFiltered.filter(o => o.paymentStatus === 'pending').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const inWarranty = filteredOrders.filter(o => o.warranty?.expiresAt && o.warranty.expiresAt > Date.now()).length;

  const grouped = WORK_ORDER_STATUSES.map(s => {
    const items = filteredOrders
      .filter(o => o.status === s.id)
      .filter(o => {
        const client = clientMap.get(o.clientId);
        const eq = equipMap.get(o.equipmentId);
        const text = `${client?.name || ''} ${eq?.brand || ''} ${eq?.model || ''} ${eq?.serialNumber || ''}`.toLowerCase();
        return !search || text.includes(search.toLowerCase());
      });
    return { ...s, items };
  });

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando órdenes...</div>;

  const kpis = [
    { label: 'En taller', value: activeOrders.length, icon: Wrench, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Por cobrar', value: totalPending, icon: DollarSign, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    { label: 'Ingresos mes', value: `$${totalRevenue.toLocaleString('es-CL')}`, icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Pendiente cobro', value: `$${pendingRevenue.toLocaleString('es-CL')}`, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'En garantía', value: inWarranty, icon: CheckCircle2, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  ];

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ClipboardList size={24} style={{ color: 'var(--primary)' }} /> Órdenes</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{activeOrders.length} activas · {filteredOrders.length} totales</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/nexus/work-orders/new" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><PlusCircle size={15} /> Nueva orden</Link>
          <MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} />
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.8rem 0.5rem 2.2rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        </div>
      </div>

      {/* KPIs - 5 en una fila */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.2rem' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={{ flex: 1, animation: `fade-up 0.4s ease ${i * 0.06}s both` }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: kpi.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{kpi.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div className="kanban-board">
        {grouped.map(column => {
          const statusColor = column.color;
          return (
            <div key={column.id} className="kanban-column" style={{ minWidth: '200px' }}>
              <div className="kanban-column-header" style={{ color: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{column.label}</span>
                <span style={{ background: `${statusColor}20`, color: statusColor, padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800 }}>{column.items.length}</span>
              </div>
              {column.items.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin órdenes</div>
              )}
              {column.items.map(order => {
                const client = clientMap.get(order.clientId);
                const eq = equipMap.get(order.equipmentId);
                return (
                  <Link key={order.id} href={`/nexus/work-orders/${order.id}`} className="kanban-card" style={{ display: 'block', textDecoration: 'none', color: 'var(--text)', padding: '0.8rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{eq?.brand} {eq?.model || '—'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{client?.name || '—'}</div>
                    {order.totalAmount > 0 && (
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>${order.totalAmount.toLocaleString('es-CL')}</div>
                    )}
                    <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : order.paymentStatus === 'partial' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: '0.55rem' }}>
                        {order.paymentStatus === 'paid' ? 'Pagado' : order.paymentStatus === 'partial' ? 'Parcial' : 'Pendiente de pago'}
                      </span>
                      {order.warrantyClaim && <span className="badge badge-orange" style={{ fontSize: '0.55rem' }}>Garantía</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
