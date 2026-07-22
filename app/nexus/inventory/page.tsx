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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', letterSpacing: '-0.03em' }}><ShoppingCart size={22} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} /> Inventario</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>{items.length} repuestos · {lowStock.length} con stock bajo</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><Plus size={15} /> Nuevo repuesto</button>
      </div>

      {lowStock.length > 0 && (
        <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.8rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{lowStock.length} repuestos con stock bajo:</span>
          <span style={{ fontSize: '0.75rem' }}>{lowStock.map(i => `${i.name} (${i.stock}/${i.minStock})`).join(', ')}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Buscar repuesto..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.4rem', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <MonthYearFilter selectedMonth={filterMonth} selectedYear={filterYear} onChange={(m, y) => { setFilterMonth(m); setFilterYear(y); }} label="Creados:" />
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input placeholder="Nombre del repuesto *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required autoFocus />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
              <input type="number" placeholder="Costo $" value={form.costPrice || ''} onChange={e => setForm({ ...form, costPrice: parseInt(e.target.value) || 0 })} style={inputStyle} />
              <input type="number" placeholder="Venta $" value={form.salePrice || ''} onChange={e => setForm({ ...form, salePrice: parseInt(e.target.value) || 0 })} style={inputStyle} />
              <input type="number" placeholder="Stock" value={form.stock || ''} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} style={inputStyle} />
              <input type="number" placeholder="Stock mínimo" value={form.minStock || ''} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input placeholder="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Unidad (ej: unidad, litro, metro)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <textarea placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost btn-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '550px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Repuesto</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Categoría</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Costo/Venta</th>
              <th style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.stock <= item.minStock;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <Link href={`/nexus/inventory/${item.id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem' }}>{item.name}</Link>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category || '—'}</td>
                  <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>${(item.costPrice || 0).toLocaleString('es-CL')}</span>
                    <span style={{ margin: '0 0.3rem' }}>→</span>
                    <span style={{ fontWeight: 700 }}>${(item.salePrice || 0).toLocaleString('es-CL')}</span>
                  </td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: isLow ? (item.stock === 0 ? '#ef4444' : '#f59e0b') : 'var(--text)', fontSize: '0.9rem' }}>
                      {item.stock} {item.unit}
                    </span>
                    {isLow && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>min: {item.minStock}</span>}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => { setAdjustPartId(item.id!); setAdjustQty(1); }} className="btn-icon" title="Ajustar stock"><PlusIcon size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adjustPartId && (
        <div onClick={() => setAdjustPartId(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '300px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ajustar stock</h3>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <button onClick={() => setAdjustQty(Math.max(-999, adjustQty - 1))} className="btn-icon" style={{ background: '#ef4444', color: '#fff' }}><Minus size={14} /></button>
              <input type="number" value={adjustQty} onChange={e => setAdjustQty(parseInt(e.target.value) || 0)} style={{ ...inputStyle, textAlign: 'center', fontWeight: 800, fontSize: '1.2rem' }} />
              <button onClick={() => setAdjustQty(adjustQty + 1)} className="btn-icon" style={{ background: '#10b981', color: '#fff' }}><PlusIcon size={14} /></button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Usa valores negativos para descontar, positivos para agregar.</p>
            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
              <button onClick={() => handleAdjust(adjustPartId)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Aplicar</button>
              <button onClick={() => setAdjustPartId(null)} className="btn btn-outline btn-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.7rem', background: '#fff', border: '1px solid var(--glass-border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
