'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getInventoryItem, getInventoryMovements, InventoryData, InventoryMovement } from '@/app/actions/nexus/inventory';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InventoryDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<InventoryData | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => Promise.all([getInventoryItem(id as string), getInventoryMovements(id as string)]).then(([ir, mr]) => {
      if (ir.success) setItem(ir.item!);
      if (mr.success) setMovements(mr.movements);
      setLoading(false);
    });
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [id]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (!item) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Repuesto no encontrado</div>;

  return (
    <div>
      <Link href="/nexus/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver
      </Link>

      <div className="bento-grid">
        <div className="bento-col-5">
          <div className="glass-panel">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Categoría</span><div>{item.category || '—'}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Proveedor</span><div>{item.supplier || '—'}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Costo</span><div style={{ fontWeight: 700 }}>${(item.costPrice || 0).toLocaleString('es-CL')}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Venta</span><div style={{ fontWeight: 700 }}>${(item.salePrice || 0).toLocaleString('es-CL')}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Stock</span><div style={{ fontWeight: 800, fontSize: '1.1rem', color: item.stock <= item.minStock ? '#ef4444' : 'var(--text)' }}>{item.stock} {item.unit}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Stock mínimo</span><div>{item.minStock} {item.unit}</div></div>
            </div>
            {item.description && <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.description}</p>}
          </div>

          {/* Price history */}
          <div className="glass-panel" style={{ marginTop: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <TrendingUp size={14} /> Historial de precios
            </h3>
            {(item.priceHistory || []).length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sin historial</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {[...(item.priceHistory || [])].reverse().map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.2rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ fontWeight: 700 }}>${(p.price || 0).toLocaleString('es-CL')}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{format(p.date, 'd MMM yyyy', { locale: es })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bento-col-7">
          <div className="glass-panel">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> Movimientos de stock
            </h3>
            {movements.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sin movimientos</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {movements.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'var(--bg-accent)', borderRadius: '4px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700 }}>{m.type === 'in' ? '+' : m.type === 'out' ? '-' : '±'}{m.quantity}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({m.previousStock} → {m.newStock})</span>
                      {m.note && <span style={{ color: 'var(--text-muted)' }}>· {m.note}</span>}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{m.createdAt ? format(m.createdAt, 'd MMM HH:mm', { locale: es }) : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
