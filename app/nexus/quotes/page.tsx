'use client';

import { useState, useEffect } from 'react';
import { getQuotes, setQuoteStatus, deleteQuote, QuoteData } from '@/app/actions/nexus/quotes';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import { getWorkOrders, WorkOrderData } from '@/app/actions/nexus/work-orders';
import Link from 'next/link';
import { FileText, Plus, Search, ExternalLink, Send, ArrowUpRight, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MonthYearFilter, { monthYearFilter } from '@/components/nexus/MonthYearFilter';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Borrador' },
  sent: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Enviada' },
  approved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Aprobada' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rechazada' },
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [orders, setOrders] = useState<WorkOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [loadError, setLoadError] = useState('');

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const load = async () => {
    try {
      const [qr, cr, er, wor] = await Promise.all([getQuotes(), getClients(), getEquipments(), getWorkOrders()]);
      if (qr.success && qr.quotes) setQuotes(qr.quotes);
      else if (!qr.success) console.error('Error quotes:', qr.error);
      if (cr.success && cr.clients) setClients(cr.clients);
      if (er.success && er.equipments) setEquipments(er.equipments);
      if (wor.success && wor.orders) setOrders(wor.orders);
    } catch (e: any) {
      setLoadError(e?.message || 'Error al cargar datos');
    }
    setLoading(false);
  };

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const equipMap = new Map(equipments.map(e => [e.id, e]));
  const orderByQuote = new Map<string, WorkOrderData>();
  orders.forEach(o => { if (o.quoteId) orderByQuote.set(o.quoteId, o); });

  const filtered = monthYearFilter(quotes.filter(q => !q.isTemplate), filterMonth, filterYear).filter(q => {
    const client = clientMap.get(q.clientId);
    const eq = equipMap.get(q.equipmentId);
    const text = `${client?.name || ''} ${eq?.brand || ''} ${eq?.model || ''} #${q.quoteNumber}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (!filter || q.status === filter);
  });

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando cotizaciones...</div>;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) {
        .q-header { flex-direction: column !important; align-items: stretch !important; gap: 0.75rem !important; }
        .q-header .btn { width: 100% !important; text-align: center !important; font-size: 0.85rem !important; padding: 0.55rem 1rem !important; }
        .q-filters { flex-wrap: nowrap !important; gap: 0.4rem !important; }
        .q-filters input { font-size: 0.85rem !important; padding: 0.55rem 0.8rem !important; }
        .q-filters .search-icon { display: none !important; }
        .q-hide-mobile, .q-hide-mobile-filter { display: none !important; }
        .q-table { min-width: unset !important; }
      }`}</style>

      <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1><FileText size={22} style={{ color: '#8b5cf6', display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} /> Cotizaciones</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{filtered.length} registradas</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link href="/nexus/quotes/templates" className="btn btn-outline btn-sm q-hide-mobile-filter">Plantillas</Link>
          <Link href="/nexus/quotes/new" className="btn btn-primary btn-sm"><Plus size={15} /> Nueva cotización</Link>
        </div>
      </div>

      <div className="q-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '200px', flex: 1 }}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Buscar por cliente, equipo o n°..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.3rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <select className="q-hide-mobile-filter" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '15%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">Todas</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviada</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
        <div className="q-hide-mobile-filter">
          <MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} />
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table className="q-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>#</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cliente / Equipo</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</th>
              <th className="q-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Orden</th>
              <th className="q-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pago</th>
              <th className="q-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado</th>
              <th className="q-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fecha</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => {
              const config = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
              const client = clientMap.get(q.clientId);
              const eq = equipMap.get(q.equipmentId);
              const linkedOrder = orderByQuote.get(q.id!);
              const displayStatus = linkedOrder
                ? { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', label: 'Orden asignada' }
                : config;
              return (
                <tr key={q.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.85rem' }}>#{String(q.quoteNumber).padStart(4, '0')}</td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{client?.name || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{eq?.brand} {eq?.model}</div>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.9rem' }}>${(q.grandTotal || 0).toLocaleString('es-CL')}</td>
                  <td className="q-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    {linkedOrder ? (
                      <Link href={`/nexus/work-orders/${linkedOrder.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                        <ArrowUpRight size={12} /> Orden
                      </Link>
                    ) : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td className="q-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    {linkedOrder ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.62rem', fontWeight: 700 }}>
                        <DollarSign size={10} />
                        {linkedOrder.paymentStatus === 'paid' ? 'Pagado' : linkedOrder.paymentStatus === 'partial' ? 'Parcial' : 'Pendiente'}
                      </span>
                    ) : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td className="q-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: displayStatus.bg, color: displayStatus.color, fontSize: '0.68rem', fontWeight: 700 }}>{displayStatus.label}</span>
                    {q.billingType === 'con_boleta' && <span className="badge" style={{ fontSize: '0.5rem', marginLeft: '0.2rem' }}>IVA</span>}
                  </td>
                  <td className="q-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.createdAt ? format(q.createdAt, 'd MMM', { locale: es }) : '—'}</td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {q.status === 'draft' && (
                      <button onClick={async () => { await setQuoteStatus(q.id!, 'sent'); load(); }} className="btn-icon" style={{ color: '#3b82f6' }} title="Marcar como enviada"><Send size={14} /></button>
                    )}
                    <Link href={`/nexus/quotes/${q.id}`} className="btn-icon"><ExternalLink size={14} /></Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{search || filter ? 'Sin resultados' : 'No hay cotizaciones'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
