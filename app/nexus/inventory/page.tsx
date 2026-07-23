'use client';

import { useState, useEffect } from 'react';
import { getInventory, createInventoryItem, adjustStock, deleteInventoryItem, InventoryData } from '@/app/actions/nexus/inventory';
import Link from 'next/link';
import { ShoppingCart, Plus, Search, AlertTriangle, Trash2, Edit3, Minus, Plus as PlusIcon } from 'lucide-react';
import MonthYearFilter, { monthYearFilter } from '@/components/nexus/MonthYearFilter';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 0, unit: 'unidad', category: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [adjustPartId, setAdjustPartId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const load = async () => {
    const r = await getInventory();
    if (r.success) setItems(r.items);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await createInventoryItem(form);
    setShowForm(false);
    setForm({ name: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 0, unit: 'unidad', category: '', description: '' });
    load();
    setSaving(false);
  };

  const handleAdjust = async (id: string) => {
    await adjustStock(id, adjustQty, 'ajuste manual');
    setAdjustPartId(null);
    setAdjustQty(0);
    load();
  };

  const lowStock = items.filter(i => i.stock <= i.minStock);
  const dateFiltered = monthYearFilter(items, filterMonth, filterYear);
  const filtered = dateFiltered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando inventario...</div>;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) {
        .inv-header { flex-direction: column !important; align-items: stretch !important; gap: 0.75rem !important; }
        .inv-header .btn { width: 100% !important; text-align: center !important; font-size: 0.85rem !important; padding: 0.55rem 1rem !important; }
        .inv-filters { flex-wrap: nowrap !important; gap: 0.4rem !important; }
        .inv-filters input { font-size: 0.85rem !important; padding: 0.55rem 0.8rem !important; }
        .inv-filters .search-icon { display: none !important; }
        .inv-hide-mobile, .inv-hide-mobile-filter { display: none !important; }
        .inv-table { min-width: unset !important; }
        .inv-form-grid { grid-template-columns: 1fr 1fr !important; }
      }`}</style>

      <div className="inv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ShoppingCart size={24} style={{ color: '#10b981' }} /> Inventario</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{items.length} repuestos · {lowStock.length} con stock bajo</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><Plus size={15} /> Nuevo repuesto</button>
      </div>

      {lowStock.length > 0 && (
        <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{lowStock.length} con stock bajo</span>
        </div>
      )}

      <div className="inv-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Buscar repuesto..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.3rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <div className="inv-hide-mobile-filter"><MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} /></div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', padding: '0.8rem' }}>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <input placeholder="Nombre del repuesto *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={s} required autoFocus />
            <div className="inv-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.3rem' }}>
              <input type="number" placeholder="Costo $" value={form.costPrice || ''} onChange={e => setForm({ ...form, costPrice: parseInt(e.target.value) || 0 })} style={s} />
              <input type="number" placeholder="Venta $" value={form.salePrice || ''} onChange={e => setForm({ ...form, salePrice: parseInt(e.target.value) || 0 })} style={s} />
              <input type="number" placeholder="Stock" value={form.stock || ''} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} style={s} />
              <input type="number" placeholder="Stock mín" value={form.minStock || ''} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} style={s} />
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input placeholder="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...s, flex: 1 }} />
              <input placeholder="Unidad" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ ...s, flex: 1 }} />
            </div>
            <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...s, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <table className="inv-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '550px', background: 'var(--surface)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Repuesto</th>
              <th className="inv-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Categoría</th>
              <th className="inv-hide-mobile" style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Costo/Venta</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stock</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.stock <= item.minStock;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <Link href={`/nexus/inventory/${item.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem' }}>{item.name}</Link>
                  </td>
                  <td className="inv-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.category || '—'}</td>
                  <td className="inv-hide-mobile" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>${(item.costPrice || 0).toLocaleString('es-CL')}</span>
                    <span style={{ margin: '0 0.3rem' }}>→</span>
                    <span style={{ fontWeight: 700 }}>${(item.salePrice || 0).toLocaleString('es-CL')}</span>
                  </td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: isLow ? (item.stock === 0 ? '#ef4444' : '#f59e0b') : 'var(--text)', fontSize: '0.9rem' }}>
                      {item.stock} {item.unit}
                    </span>
                    {isLow && <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginLeft: '0.2rem', display: 'block' }}>mín: {item.minStock}</span>}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => { setAdjustPartId(item.id!); setAdjustQty(1); }} className="btn-icon" title="Ajustar stock"><PlusIcon size={14} /></button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{search ? 'Sin resultados' : 'No hay repuestos registrados'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {adjustPartId && (
        <div onClick={() => setAdjustPartId(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: '320px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ajustar stock</h3>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <button onClick={() => setAdjustQty(Math.max(-999, adjustQty - 1))} className="btn-icon" style={{ background: '#ef4444', color: '#fff', width: '40px', height: '40px', borderRadius: '10px' }}><Minus size={18} /></button>
              <input type="number" value={adjustQty} onChange={e => setAdjustQty(parseInt(e.target.value) || 0)} style={{ ...s, textAlign: 'center', fontWeight: 800, fontSize: '1.2rem', padding: '0.5rem' }} />
              <button onClick={() => setAdjustQty(adjustQty + 1)} className="btn-icon" style={{ background: '#10b981', color: '#fff', width: '40px', height: '40px', borderRadius: '10px' }}><PlusIcon size={18} /></button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Usa valores negativos para descontar, positivos para agregar.</p>
            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
              <button onClick={() => handleAdjust(adjustPartId)} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}>Aplicar</button>
              <button onClick={() => setAdjustPartId(null)} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: React.CSSProperties = {
  padding: '0.45rem 0.65rem', background: '#fff', border: '1.5px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
