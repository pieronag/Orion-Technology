'use client';

import { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient, ClientData } from '@/app/actions/nexus/clients';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import Link from 'next/link';
import { Users, Plus, Search, Trash2, Phone, Mail, Monitor } from 'lucide-react';
import MonthYearFilter, { monthYearFilter } from '@/components/nexus/MonthYearFilter';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [billingFilter, setBillingFilter] = useState('');
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rut: '', phone: '', email: '', billingType: 'sin_boleta' as const });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const load = async () => {
    const [cr, er] = await Promise.all([getClients(), getEquipments()]);
    if (cr.success && cr.clients) setClients(cr.clients);
    if (er.success && er.equipments) setEquipments(er.equipments);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const r = await createClient(form);
    if (r.success) {
      setShowForm(false);
      setForm({ name: '', rut: '', phone: '', email: '', billingType: 'sin_boleta' });
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await deleteClient(id);
    load();
  };

  const equipByClient = new Map<string, EquipmentData[]>();
  equipments.forEach(e => {
    const list = equipByClient.get(e.clientId) || [];
    list.push(e);
    equipByClient.set(e.clientId, list);
  });

  const filtered = monthYearFilter(clients, filterMonth, filterYear).filter(c => {
    const matchesSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.rut?.includes(search) ||
      c.phone?.includes(search);
    const matchesBilling = !billingFilter || c.billingType === billingFilter;
    return matchesSearch && matchesBilling;
  });

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando clientes...</div>;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) {
        .cli-header { flex-direction: column !important; align-items: stretch !important; gap: 0.75rem !important; }
        .cli-actions { width: 100% !important; }
        .cli-actions .btn { width: 100% !important; text-align: center !important; font-size: 0.85rem !important; padding: 0.55rem 1rem !important; }
        .cli-filters { flex-wrap: nowrap !important; gap: 0.4rem !important; }
        .cli-filters input { font-size: 0.85rem !important; padding: 0.55rem 0.8rem !important; }
        .cli-filters .search-icon { display: none !important; }
        .cli-hide-mobile, .cli-hide-mobile-filter { display: none !important; }
        .cli-table { min-width: unset !important; }
        .cli-form-row { grid-template-columns: 1fr !important; }
        .cli-form-flex { flex-direction: column !important; align-items: stretch !important; }
        .cli-form-flex > select { width: 100% !important; }
      }`}</style>

      {/* Header */}
      <div className="cli-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={24} style={{ color: '#3b82f6' }} /> Clientes</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{filtered.length} registrados</p>
        </div>
        <div className="cli-actions">
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><Plus size={15} /> Nuevo cliente</button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="cli-form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.4rem' }}>
              <input placeholder="Nombre *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={s} autoFocus />
              <input placeholder="RUT" value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} style={s} />
              <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={s} />
            </div>
            <div className="cli-form-flex" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...s, flex: 1, minWidth: '150px' }} />
              <select value={form.billingType} onChange={e => setForm({ ...form, billingType: e.target.value as any })} style={{ ...s, width: 'auto' }}>
                <option value="sin_boleta">Sin boleta</option>
                <option value="con_boleta">Con boleta</option>
              </select>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="cli-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '200px', flex: 1 }}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Buscar por nombre, RUT o teléfono..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.3rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <select className="cli-hide-mobile-filter" value={billingFilter} onChange={e => setBillingFilter(e.target.value)} style={{ width: '15%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="">Todos</option>
          <option value="sin_boleta">Sin boleta</option>
          <option value="con_boleta">Con boleta</option>
        </select>
        <div className="cli-hide-mobile-filter"><MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} /></div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <table className="cli-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', background: 'var(--surface)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre</th>
              <th className="cli-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>RUT</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contacto</th>
              <th className="cli-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Equipos</th>
              <th className="cli-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tipo</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const clientEquips = equipByClient.get(c.id!) || [];
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <Link href={`/nexus/clients/${c.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem' }}>{c.name}</Link>
                  </td>
                  <td className="cli-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.rut || '—'}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}><Phone size={12} /> {c.phone}</span>}
                      {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--text-muted)' }}><Mail size={12} /> {c.email}</span>}
                    </div>
                  </td>
                  <td className="cli-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}>
                      <Monitor size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 700 }}>{clientEquips.length}</span>
                    </div>
                  </td>
                  <td className="cli-hide-mobile" style={{ padding: '0.6rem 1rem' }}>
                    <span className={`badge ${c.billingType === 'con_boleta' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: '0.6rem' }}>
                      {c.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(c.id!)} className="btn-icon" style={{ color: '#ef4444' }} title="Eliminar"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{search ? 'Sin resultados' : 'No hay clientes registrados'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s: React.CSSProperties = {
  padding: '0.45rem 0.65rem', background: '#fff', border: '1.5px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
