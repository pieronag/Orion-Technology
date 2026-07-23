'use client';

import { useState, useEffect } from 'react';
import { getPayments, PaymentData } from '@/app/actions/nexus/payments';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { getWorkOrders, WorkOrderData } from '@/app/actions/nexus/work-orders';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import Link from 'next/link';
import { DollarSign, TrendingUp, CreditCard, Receipt, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PAYMENT_METHODS, WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';
import MonthYearFilter from '@/components/nexus/MonthYearFilter';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [orders, setOrders] = useState<WorkOrderData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  useEffect(() => {
    const load = () => Promise.all([getPayments(), getClients(), getWorkOrders(), getEquipments()]).then(([pr, cr, wor, er]) => {
      if (pr.success && pr.payments) setPayments(pr.payments);
      if (cr.success && cr.clients) setClients(cr.clients);
      if (wor.success && wor.orders) setOrders(wor.orders);
      if (er.success && er.equipments) setEquipments(er.equipments);
      setLoading(false);
    });
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const orderMap = new Map(orders.map(o => [o.id, o]));
  const equipMap = new Map(equipments.map(e => [e.id, e]));

  const dateFiltered = payments.filter(p => {
    if (!p.date) return true;
    const d = new Date(p.date);
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  });

  const totalPayments = dateFiltered.reduce((s, p) => s + p.amount, 0);
  const methodCounts: Record<string, number> = {};
  dateFiltered.forEach(p => { methodCounts[p.method] = (methodCounts[p.method] || 0) + p.amount; });
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];
  const paymentCount = dateFiltered.length;

  const filtered = dateFiltered;

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando pagos...</div>;

  const statCards = [
    { label: 'Ingresos del mes', value: `$${totalPayments.toLocaleString('es-CL')}`, icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Pagos registrados', value: paymentCount, icon: Receipt, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { label: 'Método más usado', value: topMethod ? PAYMENT_METHODS.find(m => m.id === topMethod[0])?.label || topMethod[0] : '—', icon: CreditCard, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
    { label: 'Promedio por pago', value: paymentCount > 0 ? `$${(totalPayments / paymentCount).toLocaleString('es-CL')}` : '—', icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ];

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`.pay-filter-wrap > div { justify-content: space-between !important; width: 100% !important; } @media (max-width: 640px) {
        .pay-header { flex-direction: column !important; align-items: stretch !important; gap: 0.75rem !important; }
        .pay-filters { flex-wrap: nowrap !important; gap: 0.4rem !important; }
        .pay-filters input { font-size: 0.85rem !important; padding: 0.55rem 0.8rem !important; }
        .pay-filters .search-icon { display: none !important; }

        .pay-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0.4rem !important; }
        .pay-stats > div { width: 100% !important; }
        .pay-hide-mobile { display: none !important; }
        .pay-table { min-width: unset !important; }
      }`}</style>

      <div className="pay-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><DollarSign size={24} style={{ color: '#10b981' }} /> Pagos</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{filtered.length} registros</p>
        </div>
      </div>

      {/* Stats cards - 2 columns on mobile */}
      <div className="pay-stats bento-grid" style={{ marginBottom: '1.2rem' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bento-col-3" style={{ animation: `fade-up 0.4s ease ${i * 0.08}s both` }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color: card.color }} />
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

      {/* Month filter */}
      <div className="pay-filter-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}><MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} /></div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <table className="pay-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px', background: 'var(--surface)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cliente</th>
              <th className="pay-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Equipo</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Monto</th>
              <th className="pay-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>M&eacute;todo</th>
              <th className="pay-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado orden</th>
              <th className="pay-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fecha</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const client = clientMap.get(p.clientId);
              const order = orderMap.get(p.workOrderId);
              const equip = equipMap.get(order?.equipmentId || '');
              const statusDef = WORK_ORDER_STATUSES.find(s => s.id === order?.status);
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>{client?.name || '—'}</td>
                  <td className="pay-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{equip?.brand} {equip?.model || '—'}</td>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>${p.amount.toLocaleString('es-CL')}</td>
                  <td className="pay-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      {p.method === 'cash' ? '💵' : p.method === 'transfer' ? '🏦' : p.method === 'card' ? '💳' : '📄'}
                      {' '}{PAYMENT_METHODS.find(m => m.id === p.method)?.label || p.method}
                    </span>
                  </td>
                  <td className="pay-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    {order ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', borderRadius: '6px', background: `${statusDef?.color}15`, color: statusDef?.color, fontSize: '0.62rem', fontWeight: 700 }}>
                        {statusDef?.label || order.status}
                      </span>
                    ) : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td className="pay-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(p.date, 'd MMM HH:mm', { locale: es })}</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                    <Link href={`/nexus/work-orders/${p.workOrderId}`} className="btn-icon" title="Ver orden"><ArrowUpRight size={15} /></Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin pagos registrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
