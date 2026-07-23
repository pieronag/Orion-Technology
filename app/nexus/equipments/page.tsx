'use client';

import { useState, useEffect } from 'react';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { getWorkOrders, WorkOrderData } from '@/app/actions/nexus/work-orders';
import Link from 'next/link';
import { Monitor, Plus, Search, Wrench, ClipboardList, AlertTriangle, TrendingUp } from 'lucide-react';
import { EQUIPMENT_TYPES, WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';
import MonthYearFilter, { monthYearFilter } from '@/components/nexus/MonthYearFilter';
import { warrantyDaysLeft } from '@/lib/firestore-utils';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [orders, setOrders] = useState<WorkOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const load = async () => {
    const [er, cr, wor] = await Promise.all([getEquipments(), getClients(), getWorkOrders()]);
    if (er.success && er.equipments) setEquipments(er.equipments);
    if (cr.success) setClients(cr.clients);
    if (wor.success && wor.orders) setOrders(wor.orders);
    setLoading(false);
  };

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const ordersByEquipment = new Map<string, WorkOrderData[]>();
  orders.forEach(o => {
    const list = ordersByEquipment.get(o.equipmentId) || [];
    list.push(o);
    ordersByEquipment.set(o.equipmentId, list);
  });

  const filtered = monthYearFilter(equipments, filterMonth, filterYear).filter(e => {
    const client = clientMap.get(e.clientId);
    const eqOrders = ordersByEquipment.get(e.id!) || [];
    const activeOrders = eqOrders.filter(o => o.status !== 'delivered');
    const text = `${e.brand} ${e.model} ${e.serialNumber || ''} ${client?.name || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesType = !typeFilter || e.type === typeFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && activeOrders.length > 0) ||
      (statusFilter === 'inactive' && activeOrders.length === 0) ||
      (statusFilter === 'warranty' && eqOrders.some(o => o.warranty?.expiresAt && o.warranty.expiresAt > Date.now()));
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalEquipments = filtered.length;
  const inWorkshop = filtered.filter(e => {
    const eqOrders = ordersByEquipment.get(e.id!) || [];
    return eqOrders.some(o => o.status !== 'delivered');
  }).length;

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando equipos...</div>;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) {
        .eq-header { flex-direction: column !important; align-items: stretch !important; gap: 0.75rem !important; }
        .eq-header .btn { width: 100% !important; text-align: center !important; font-size: 0.85rem !important; padding: 0.55rem 1rem !important; }
        .eq-filters { flex-wrap: nowrap !important; gap: 0.4rem !important; }
        .eq-filters input { font-size: 0.85rem !important; padding: 0.55rem 0.8rem !important; }
        .eq-filters .search-icon { display: none !important; }
        .eq-hide-mobile, .eq-hide-mobile-filter { display: none !important; }
        .eq-table { min-width: unset !important; }
      }`}</style>
      <div className="eq-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Monitor size={24} style={{ color: 'var(--secondary)' }} /> Equipos</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{filtered.length} registrados · {inWorkshop} en taller</p>
        </div>
        <Link href="/nexus/equipments/new" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Plus size={15} /> Nuevo equipo</Link>
      </div>

      <div className="eq-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '200px', flex: 1 }}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Buscar por equipo, serie o cliente..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.3rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <select className="eq-hide-mobile-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: '15%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">Todos</option>
          {EQUIPMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select className="eq-hide-mobile-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '15%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">Todos</option>
          <option value="active">En taller</option>
          <option value="inactive">Sin orden activa</option>
          <option value="warranty">En garant&iacute;a</option>
        </select>
        <div className="eq-hide-mobile-filter"><MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} /></div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table className="eq-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Equipo</th>
              <th className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tipo</th>
              <th className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Serie</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cliente</th>
              <th className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado</th>
              <th className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>&Oacute;rdenes</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(eq => {
              const client = clientMap.get(eq.clientId);
              const eqOrders = ordersByEquipment.get(eq.id!) || [];
              const activeOrders = eqOrders.filter(o => o.status !== 'delivered');
              const lastOrder = eqOrders[0];
              const lastStatus = lastOrder ? eqOrders.find(o => o.id === lastOrder.id) : null;
              const statusDef = lastOrder ? WORK_ORDER_STATUSES.find(s => s.id === lastOrder.status) : null;
              const totalSpent = eqOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
              const inWarranty = eqOrders.some(o => o.warranty?.expiresAt && warrantyDaysLeft(o.warranty.expiresAt) > 0);
              const warrantyDays = eqOrders.reduce((max, o) => {
                const days = o.warranty?.expiresAt ? warrantyDaysLeft(o.warranty.expiresAt) : 0;
                return days > max ? days : max;
              }, 0);
              return (
                <tr key={eq.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <Link href={`/nexus/equipments/${eq.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem' }}>{eq.brand} {eq.model}</Link>
                  </td>
                  <td className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(eq.type || '').toUpperCase()}</td>
                  <td className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{eq.serialNumber || '—'}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                    {client ? <Link href={`/nexus/clients/${client.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.78rem' }}>{client.name}</Link> : '—'}
                  </td>
                  <td className="eq-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    {activeOrders.length > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', borderRadius: '6px', background: `${statusDef?.color}15`, color: statusDef?.color, fontSize: '0.6rem', fontWeight: 700 }}>
                        {statusDef?.label || 'En taller'}
                      </span>
                    ) : inWarranty ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b' }}>
                        <AlertTriangle size={10} /> {warrantyDays}d garant&iacute;a
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inactivo</span>
                    )}
                  </td>
                  <td className="eq-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ClipboardList size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 700 }}>{eqOrders.length}</span>
                      {totalSpent > 0 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>${totalSpent.toLocaleString('es-CL')}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                    <Link href={`/nexus/equipments/${eq.id}`} className="btn-icon" title="Ver detalle"><Wrench size={14} /></Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{search ? 'Sin resultados' : 'No hay equipos registrados'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
