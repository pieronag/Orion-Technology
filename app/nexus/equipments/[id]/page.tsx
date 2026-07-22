'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getEquipment, updateEquipment, EquipmentData } from '@/app/actions/nexus/equipments';
import { getEquipmentWorkOrders, WorkOrderData } from '@/app/actions/nexus/work-orders';
import { getWorkOrderPayments, PaymentData } from '@/app/actions/nexus/payments';
import Link from 'next/link';
import { ArrowLeft, Monitor, Camera, Clock, History, ExternalLink, Wrench, X, DollarSign, Shield, Package, Search, FileText, FlaskConical, CheckCheck, Truck, CheckCircle2, Edit3, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WORK_ORDER_STATUSES, EQUIPMENT_TYPES, PAYMENT_METHODS } from '@/data/diagnosis-templates';

import { dedupeTimeline, warrantyDaysLeft } from '@/lib/firestore-utils';

const STATUS_ICONS: Record<string, any> = {
  received: Package, diagnosing: Search, quoted: FileText, approved: CheckCircle2,
  repairing: Wrench, testing: FlaskConical, ready: CheckCheck, delivered: Truck,
};

function OrderModal({ order, onClose }: { order: WorkOrderData; onClose: () => void }) {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    getWorkOrderPayments(order.id!).then(r => {
      if (r.success && r.payments) setPayments(r.payments);
      setLoadingPayments(false);
    });
  }, [order.id]);

  const statusDef = WORK_ORDER_STATUSES.find(s => s.id === order.status);
  const StatusIcon = STATUS_ICONS[order.status] || Clock;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (order.totalAmount || 0) - totalPaid;
  const inWarranty = order.warranty?.expiresAt && order.warranty.expiresAt > Date.now();

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <StatusIcon size={22} style={{ color: statusDef?.color }} />
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Orden de trabajo</h3>
              <span style={{ fontSize: '0.75rem', color: statusDef?.color, fontWeight: 700 }}>{statusDef?.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status progression */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', overflowX: 'auto' }}>
            {WORK_ORDER_STATUSES.map((s, i) => {
              const idx = WORK_ORDER_STATUSES.findIndex(st => st.id === order.status);
              const isDone = i <= idx;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexShrink: 0 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isDone ? s.color : 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#fff', fontWeight: 800 }}>
                    {isDone ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  {i < WORK_ORDER_STATUSES.length - 1 && <div style={{ width: '12px', height: '2px', background: isDone && i < idx ? s.color : 'var(--glass-border)' }}></div>}
                </div>
              );
            })}
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Creada</span>
              <div style={{ fontWeight: 600 }}>{order.createdAt ? format(order.createdAt, 'd MMM yyyy HH:mm', { locale: es }) : '—'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado pago</span>
              <div><span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : order.paymentStatus === 'partial' ? 'badge-orange' : ''}`} style={{ fontSize: '0.65rem' }}>{order.paymentStatus === 'paid' ? 'Pagado' : order.paymentStatus === 'partial' ? 'Parcial' : 'Pendiente'}</span></div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</span>
              <div style={{ fontWeight: 800, color: 'var(--primary)' }}>${(order.totalAmount || 0).toLocaleString('es-CL')}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facturación</span>
              <div>{order.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}</div>
            </div>
            {order.assignedTo && (
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Técnico</span>
                <div style={{ fontWeight: 600 }}>{order.assignedTo}</div>
              </div>
            )}
            {order.branch && (
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sucursal</span>
                <div style={{ fontWeight: 600 }}>{order.branch}</div>
              </div>
            )}
          </div>

          {/* Warranty */}
          {order.warranty?.expiresAt && (
            <div style={{ padding: '0.5rem', background: warrantyDaysLeft(order.warranty.expiresAt) > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.06)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
              <Shield size={16} color={warrantyDaysLeft(order.warranty.expiresAt) > 0 ? '#f59e0b' : '#ef4444'} />
              <span style={{ fontWeight: 600 }}>
                {warrantyDaysLeft(order.warranty.expiresAt) > 0
                  ? `En garantía — ${warrantyDaysLeft(order.warranty.expiresAt)} días restantes (expira ${format(order.warranty.expiresAt, 'd MMM yyyy', { locale: es })})`
                  : `Garantía expirada — venció el ${format(order.warranty.expiresAt, 'd MMM yyyy', { locale: es })}`}
              </span>
            </div>
          )}

          {/* Diagnosis / Notes */}
          {order.diagnosis && (
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnóstico</span>
              <div style={{ fontSize: '0.82rem', marginTop: '0.2rem', whiteSpace: 'pre-wrap' }}>{order.diagnosis}</div>
            </div>
          )}
          {order.repairNotes && (
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Notas de reparación</span>
              <div style={{ fontSize: '0.82rem', marginTop: '0.2rem', whiteSpace: 'pre-wrap' }}>{order.repairNotes}</div>
            </div>
          )}

          {/* Payments */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pagos</span>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem' }}>
                <span>Pagado: <strong style={{ color: '#10b981' }}>${totalPaid.toLocaleString('es-CL')}</strong></span>
                <span>Saldo: <strong style={{ color: balance > 0 ? '#ef4444' : '#10b981' }}>${balance.toLocaleString('es-CL')}</strong></span>
              </div>
            </div>
            {payments.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sin pagos registrados</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {payments.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: 'var(--bg-accent)', borderRadius: '4px', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 700 }}>${p.amount.toLocaleString('es-CL')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{PAYMENT_METHODS.find(m => m.id === p.method)?.label || p.method}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{format(p.date, 'd MMM HH:mm', { locale: es })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Timeline</span>
            <div style={{ position: 'relative', paddingLeft: '14px' }}>
              <div style={{ position: 'absolute', left: '4px', top: '4px', bottom: '4px', width: '2px', background: 'var(--glass-border)' }}></div>
              {dedupeTimeline(order.timeline || []).map((t, i) => {
                const sDef = WORK_ORDER_STATUSES.find(s => s.id === t.status);
                return (
                  <div key={t.status} style={{ position: 'relative', paddingBottom: '0.5rem', paddingLeft: '0.7rem' }}>
                    <span style={{ position: 'absolute', left: '-11px', top: '4px', width: '9px', height: '9px', borderRadius: '50%', background: sDef?.color || '#888', border: '2px solid #fff', zIndex: 1 }}></span>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{sDef?.label || t.status}</div>
                    {t.note && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.note}</div>}
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{format(t.date, 'd MMM yyyy HH:mm', { locale: es })}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
          <Link href={`/nexus/work-orders/${order.id}`} className="btn btn-primary btn-sm" style={{ fontSize: '0.78rem' }}>
            <ExternalLink size={13} /> Ver orden completa
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState<EquipmentData | null>(null);
  const [orders, setOrders] = useState<WorkOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [modalOrder, setModalOrder] = useState<WorkOrderData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EquipmentData>>({});

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    setErrorMsg('');
    const [er, or] = await Promise.all([
      getEquipment(id as string),
      getEquipmentWorkOrders(id as string),
    ]);
    if (er.success && er.equipment) setEquipment(er.equipment);
    else if (!er.success) setErrorMsg('Error al cargar equipo: ' + (er.error || 'desconocido'));
    if (or.success && or.orders) setOrders(or.orders);
    else if (!or.success) console.error('Error loading orders:', or.error);
    setLoading(false);
  };

  const handleSaveEquipment = async () => {
    if (!equipment) return;
    await updateEquipment(id as string, editForm);
    setEditing(false);
    load();
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (errorMsg) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</div>;
  if (!equipment) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Equipo no encontrado</div>;

  const currentOrder = orders[0];

  const inputStyle: React.CSSProperties = {
    padding: '0.45rem 0.65rem', background: '#fff', border: '1.5px solid var(--border)',
    borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '100%',
  };

  return (
    <div>
      <Link href="/nexus/equipments" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver a equipos
      </Link>

      <div className="bento-grid">
        {/* Info card */}
        <div className="bento-col-5">
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={22} style={{ color: 'var(--secondary)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{equipment.brand} {equipment.model}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{EQUIPMENT_TYPES.find(t => t.id === equipment.type)?.label || equipment.type} {equipment.serialNumber && `· ${equipment.serialNumber}`}</span>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
              {!editing ? (
                <button onClick={() => { setEditForm({ condition: equipment.condition, password: equipment.password, accessories: equipment.accessories, notes: equipment.notes, brand: equipment.brand, model: equipment.model, serialNumber: equipment.serialNumber, type: equipment.type }); setEditing(true); }} className="btn-icon" style={{ color: 'var(--text-muted)' }} title="Editar equipo"><Edit3 size={15} /></button>
              ) : null}
            </div>
            {!editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Estado f&iacute;sico</span><div style={{ fontWeight: 600 }}>{equipment.condition || '—'}</div></div>
                <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Contrase&ntilde;a</span><div style={{ fontWeight: 600 }}>{equipment.password || '—'}</div></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Accesorios</span><div style={{ fontWeight: 600 }}>{equipment.accessories?.length ? equipment.accessories.join(', ') : '—'}</div></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Notas</span><div style={{ fontWeight: 600 }}>{equipment.notes || '—'}</div></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  <select value={editForm.type || equipment.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={inputStyle}>
                    {EQUIPMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <input placeholder="Marca" value={editForm.brand ?? equipment.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  <input placeholder="Modelo" value={editForm.model ?? equipment.model} onChange={e => setEditForm({ ...editForm, model: e.target.value })} style={inputStyle} />
                  <input placeholder="N° Serie" value={(editForm.serialNumber ?? equipment.serialNumber) || ''} onChange={e => setEditForm({ ...editForm, serialNumber: e.target.value })} style={inputStyle} />
                </div>
                <input placeholder="Estado f&iacute;sico" value={(editForm.condition ?? equipment.condition) || ''} onChange={e => setEditForm({ ...editForm, condition: e.target.value })} style={inputStyle} />
                <input placeholder="Contrase&ntilde;a" value={(editForm.password ?? equipment.password) || ''} onChange={e => setEditForm({ ...editForm, password: e.target.value })} style={inputStyle} />
                <input placeholder="Accesorios (separados por coma)" value={((editForm.accessories ?? equipment.accessories) || []).join(', ')} onChange={e => setEditForm({ ...editForm, accessories: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={inputStyle} />
                <textarea placeholder="Notas" value={(editForm.notes ?? equipment.notes) || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={handleSaveEquipment} className="btn btn-primary btn-sm"><Check size={13} /> Guardar</button>
                  <button onClick={() => setEditing(false)} className="btn btn-outline btn-sm"><X size={13} /> Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Photos */}
          {equipment.photos && equipment.photos.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Camera size={14} /> Fotos ({equipment.photos.length})</h3>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {equipment.photos.map((url, i) => (
                  <img key={i} src={url} alt="" onClick={() => setSelectedPhoto(url)}
                    style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover', cursor: 'pointer', border: selectedPhoto === url ? '2px solid var(--primary)' : '1px solid var(--glass-border)' }} />
                ))}
              </div>
            </div>
          )}

          {selectedPhoto && (
            <div onClick={() => setSelectedPhoto(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }}>
              <img src={selectedPhoto} alt="" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        {/* Work orders history */}
        <div className="bento-col-7">
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><History size={16} /> Historial de órdenes ({orders.length})</h3>
              {currentOrder && (
                <Link href={`/nexus/work-orders/${currentOrder.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ExternalLink size={14} /> Orden activa
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin órdenes de trabajo registradas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {orders.map(order => {
                  const statusDef = WORK_ORDER_STATUSES.find(s => s.id === order.status);
                  return (
                    <button key={order.id} onClick={() => setModalOrder(order)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)', textDecoration: 'none', color: 'var(--text)', cursor: 'pointer', background: '#fff', width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                      className="hover:bg-[rgba(0,0,0,0.02)]">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusDef?.color || '#888', flexShrink: 0 }}></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{statusDef?.label || order.status}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{format(order.createdAt || 0, 'd MMM yyyy', { locale: es })}</div>
                      </div>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : order.paymentStatus === 'partial' ? 'badge-orange' : ''}`} style={{ fontSize: '0.6rem' }}>
                        {order.paymentStatus === 'paid' ? 'Pagado' : order.paymentStatus === 'partial' ? 'Parcial' : 'Pendiente'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>${(order.totalAmount || 0).toLocaleString('es-CL')}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>Ver →</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline of current order */}
          {currentOrder?.timeline && currentOrder.timeline.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Timeline última orden</h3>
              <div style={{ position: 'relative', paddingLeft: '16px' }}>
                <div style={{ position: 'absolute', left: '5px', top: '4px', bottom: '4px', width: '2px', background: 'var(--glass-border)' }}></div>
                {dedupeTimeline(currentOrder.timeline).map((t, i) => {
                  const sDef = WORK_ORDER_STATUSES.find(s => s.id === t.status);
                  return (
                    <div key={t.status} style={{ position: 'relative', paddingBottom: '0.5rem', paddingLeft: '0.8rem' }}>
                      <span style={{ position: 'absolute', left: '-12px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: sDef?.color || '#888', border: '2px solid #fff', zIndex: 1 }}></span>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{sDef?.label || t.status}</div>
                      {t.note && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.note}</div>}
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{format(t.date, 'd MMM yyyy HH:mm', { locale: es })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {modalOrder && <OrderModal order={modalOrder} onClose={() => setModalOrder(null)} />}
    </div>
  );
}
