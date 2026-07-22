'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getClient, updateClient, ClientData } from '@/app/actions/nexus/clients';
import { getClientEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import { getWorkOrders, WorkOrderData } from '@/app/actions/nexus/work-orders';
import { WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, User, Monitor, Wrench, Edit3, Check, X, Plus, Shield, AlertTriangle } from 'lucide-react';

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<ClientData | null>(null);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<ClientData>>({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orders, setOrders] = useState<WorkOrderData[]>([]);

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    setErrorMsg('');
    const [cr, er, wor] = await Promise.all([getClient(id as string), getClientEquipments(id as string), getWorkOrders()]);
    if (cr.success && cr.client) { setClient(cr.client); setForm(cr.client); }
    else if (!cr.success) setErrorMsg('Error al cargar cliente: ' + (cr.error || ''));
    if (er.success && er.equipments) setEquipments(er.equipments);
    if (wor.success && wor.orders) setOrders(wor.orders);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const r = await updateClient(id as string, form);
    if (r.success) {
      setEditing(false);
      load();
    }
    setSaving(false);
  };

  const latestOrderByEquipment = new Map<string, WorkOrderData>();
  orders.forEach(o => {
    const existing = latestOrderByEquipment.get(o.equipmentId);
    if (!existing || (o.createdAt || 0) > (existing.createdAt || 0)) {
      latestOrderByEquipment.set(o.equipmentId, o);
    }
  });

  const equipmentWithOrders = equipments.map(eq => {
    const lastOrder = latestOrderByEquipment.get(eq.id!);
    const statusDef = lastOrder ? WORK_ORDER_STATUSES.find(s => s.id === lastOrder.status) : null;
    const inWarranty = lastOrder?.warranty?.expiresAt && lastOrder.warranty.expiresAt > Date.now();
    const hasActiveOrder = lastOrder && lastOrder.status !== 'delivered';
    return { ...eq, lastOrder, statusDef, inWarranty, hasActiveOrder };
  });

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (errorMsg) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</div>;
  if (!client) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Cliente no encontrado</div>;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <Link href="/nexus/clients" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver a clientes
      </Link>

      <div className="bento-grid">
        {/* Client info */}
        <div className="bento-col-5">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={22} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  {editing ? (
                    <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} style={s} autoFocus />
                  ) : (
                    <h2 style={{ margin: 0 }}>{client.name}</h2>
                  )}
                  <span className={`badge ${client.billingType === 'con_boleta' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: '0.6rem', marginTop: '0.15rem' }}>
                    {client.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}
                  </span>
                </div>
              </div>
              {editing ? (
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ opacity: saving ? 0.5 : 1 }}>
                    <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setEditing(false); setForm(client); }} className="btn btn-outline btn-sm"><X size={14} /> Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-icon" style={{ color: 'var(--text-muted)' }} title="Editar"><Edit3 size={16} /></button>
              )}
            </div>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <input placeholder="RUT" value={form.rut || ''} onChange={e => setForm({ ...form, rut: e.target.value })} style={s} />
                  <input placeholder="Teléfono" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} style={s} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <input placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} style={s} />
                  <select value={form.billingType || 'sin_boleta'} onChange={e => setForm({ ...form, billingType: e.target.value as any })} style={s}>
                    <option value="sin_boleta">Sin boleta</option>
                    <option value="con_boleta">Con boleta</option>
                  </select>
                </div>
                <input placeholder="Dirección" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} style={s} />
                <textarea placeholder="Notas" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...s, resize: 'vertical' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>RUT</span>
                  <div style={{ fontWeight: 600 }}>{client.rut || '—'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Teléfono</span>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {client.phone || '—'}
                    {client.phone && <Link href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=Hola%20${client.name}%2C%20te%20escribimos%20de%20Orion%20Technology`} target="_blank" style={{ color: '#25D366' }} title="Enviar WhatsApp"><Phone size={14} /></Link>}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Email</span>
                  <div style={{ fontWeight: 600 }}>{client.email || '—'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Facturación</span>
                  <div style={{ fontWeight: 600 }}>{client.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Dirección</span>
                  <div style={{ fontWeight: 600 }}>{client.address || '—'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Notas</span>
                  <div style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{client.notes || '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Equipment */}
        <div className="bento-col-7">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Monitor size={16} /> Equipos ({equipments.length})</h3>
              <Link href={`/nexus/equipments/new?clientId=${id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Plus size={14} /> Nuevo equipo</Link>
            </div>
            {equipments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Este cliente no tiene equipos registrados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {equipmentWithOrders.map(eq => (
                  <Link key={eq.id} href={`/nexus/equipments/${eq.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.7rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', transition: 'all 0.15s' }} className="hover:bg-[rgba(0,0,0,0.015)]">
                    <Wrench size={17} style={{ color: 'var(--secondary)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{eq.brand} {eq.model}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <span>{(eq.type || '').toUpperCase()} {eq.serialNumber ? `· ${eq.serialNumber}` : ''}</span>
                        {eq.statusDef && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: `${eq.statusDef.color}15`, color: eq.statusDef.color, fontSize: '0.6rem', fontWeight: 700 }}>
                            {eq.statusDef.label}
                          </span>
                        )}
                        {eq.inWarranty && (
                          <Shield size={11} color="#f59e0b" />
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ver →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: React.CSSProperties = {
  padding: '0.45rem 0.65rem', background: '#fff', border: '1.5px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
