'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuote, setQuoteStatus, updateQuote, saveQuoteAsTemplate, getQuoteLinkedWorkOrder, QuoteData, QuoteItem } from '@/app/actions/nexus/quotes';
import { getClient } from '@/app/actions/nexus/clients';
import { getEquipment } from '@/app/actions/nexus/equipments';
import Link from 'next/link';
import { ArrowLeft, Send, Check, X, Copy, Save, Printer, CheckCircle2, AlertCircle, Phone, Plus, Trash2, Edit3, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Borrador' },
  sent: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Enviada' },
  approved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Aprobada' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rechazada' },
};

export default function QuoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [clientName, setClientName] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingItems, setEditingItems] = useState(false);
  const [editItems, setEditItems] = useState<QuoteItem[]>([]);
  const [editBillingType, setEditBillingType] = useState<'sin_boleta' | 'con_boleta'>('sin_boleta');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [linkedOrderId, setLinkedOrderId] = useState<string | null>(null);

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    const qr = await getQuote(id as string);
    if (!qr.success || !qr.quote) return;
    setQuote(qr.quote);
    setEditItems(qr.quote.items || []);
    setEditBillingType(qr.quote.billingType);
    setEditNotes(qr.quote.notes || '');
    const [cr, er] = await Promise.all([getClient(qr.quote.clientId), getEquipment(qr.quote.equipmentId)]);
    if (cr.success) { setClientName(cr.client?.name || ''); setClientPhone(cr.client?.phone || ''); }
    if (er.success) setEquipmentName(`${er.equipment?.brand || ''} ${er.equipment?.model || ''}`);
    const wor = await getQuoteLinkedWorkOrder(id as string);
    if (wor.success) setLinkedOrderId(wor.workOrderId);
    setLoading(false);
  };

  const handleStatus = async (status: QuoteData['status']) => {
    await setQuoteStatus(id as string, status);
    load();
  };

  const handleSaveTemplate = async () => {
    const name = prompt('Nombre para la plantilla:');
    if (name) { await saveQuoteAsTemplate(id as string, name); alert('Plantilla guardada'); }
  };

  const handleSaveItems = async () => {
    setSaving(true);
    const subtotal = editItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const iva = editBillingType === 'con_boleta' ? Math.round(subtotal * 0.19) : 0;
    const grandTotal = editBillingType === 'con_boleta' ? subtotal + iva : subtotal;
    await updateQuote(id as string, {
      items: editItems,
      billingType: editBillingType,
      subtotal,
      total: subtotal,
      iva: editBillingType === 'con_boleta' ? iva : undefined,
      grandTotal,
      notes: editNotes,
    });
    setEditingItems(false);
    setSaving(false);
    load();
  };

  const addItem = () => setEditItems([...editItems, { description: '', quantity: 1, unitPrice: 0, type: 'labor' }]);
  const removeItem = (idx: number) => editItems.length > 1 && setEditItems(editItems.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...editItems];
    (newItems[idx] as any)[field] = value;
    setEditItems(newItems);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (!quote) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Cotizaci&oacute;n no encontrada</div>;

  const config = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const displayStatus = linkedOrderId && quote.status === 'approved'
    ? { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', label: 'Orden asignada' }
    : config;
  const subtotal = quote.items?.reduce((s, i) => s + i.quantity * i.unitPrice, 0) || 0;
  const editSubtotal = editItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const editIva = editBillingType === 'con_boleta' ? Math.round(editSubtotal * 0.19) : 0;
  const editGrandTotal = editBillingType === 'con_boleta' ? editSubtotal + editIva : editSubtotal;

  const whatsappMsg = encodeURIComponent(`Hola ${clientName}, tu cotización #${String(quote.quoteNumber).padStart(4, '0')} está lista.`);

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <Link href="/nexus/quotes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver
      </Link>

      <div className="bento-grid">
        {/* Left: Items */}
        <div className="bento-col-5">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Cotizaci&oacute;n #{String(quote.quoteNumber).padStart(4, '0')}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{clientName} · {equipmentName}</p>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.7rem', borderRadius: '20px', background: displayStatus.bg, color: displayStatus.color, fontWeight: 700, fontSize: '0.72rem' }}>
                {displayStatus.label === 'Orden asignada' ? <ExternalLink size={14} /> : quote.status === 'approved' ? <CheckCircle2 size={14} /> : quote.status === 'rejected' ? <AlertCircle size={14} /> : null}
                {displayStatus.label}
              </span>
            </div>

            {!editingItems ? (
              <>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                  {quote.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>{item.description}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                          {item.type === 'labor' ? 'MO' : 'Resp.'} x{item.quantity}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700 }}>${(item.quantity * item.unitPrice).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '2px solid var(--text)', paddingTop: '0.4rem', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span><span style={{ fontWeight: 600 }}>${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  {quote.billingType === 'con_boleta' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>IVA (19%):</span><span style={{ fontWeight: 600 }}>${(quote.iva || 0).toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.3rem', marginTop: '0.1rem' }}>
                    <span style={{ fontWeight: 700 }}>Total:</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>${(quote.grandTotal || 0).toLocaleString('es-CL')}</span>
                  </div>
                </div>

                {quote.notes && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600 }}>Notas:</span> {quote.notes}
                  </div>
                )}

                <button onClick={() => { setEditItems(quote.items || []); setEditBillingType(quote.billingType); setEditNotes(quote.notes || ''); setEditingItems(true); }} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Edit3 size={13} /> Editar cotizaci&oacute;n
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Editar items</span>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Facturaci&oacute;n:</span>
                    <select value={editBillingType} onChange={e => setEditBillingType(e.target.value as any)} style={s}>
                      <option value="sin_boleta">Sin boleta</option>
                      <option value="con_boleta">Con boleta (+IVA)</option>
                    </select>
                  </div>
                </div>

                {editItems.map((item, i) => (
                  <div key={i} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                      <select value={item.type} onChange={e => updateItem(i, 'type', e.target.value)} style={{ width: 'auto', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                        <option value="labor">🛠 Mano de obra</option>
                        <option value="part">🔧 Repuesto</option>
                      </select>
                      <button onClick={() => removeItem(i)} className="btn-icon" style={{ color: '#ef4444', width: '28px', height: '28px' }}><Trash2 size={14} /></button>
                    </div>
                    <input placeholder="Descripci&oacute;n del servicio o repuesto..." value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={{ ...s, fontSize: '0.85rem', padding: '0.4rem 0.6rem', marginBottom: '0.3rem' }} />
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>Cantidad</label>
                        <input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} style={{ ...s, fontSize: '0.85rem', padding: '0.4rem 0.6rem', textAlign: 'center' }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.1rem' }}>Precio unitario</label>
                        <input type="number" value={item.unitPrice || ''} onChange={e => updateItem(i, 'unitPrice', parseInt(e.target.value) || 0)} style={{ ...s, fontSize: '0.85rem', padding: '0.4rem 0.6rem', textAlign: 'right' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '0.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Subtotal: <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>${(item.quantity * item.unitPrice).toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                ))}

                <button onClick={addItem} className="btn btn-outline btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center', marginTop: '0.3rem' }}>
                  <Plus size={14} /> Agregar item
                </button>

                <div style={{ textAlign: 'right', marginTop: '0.3rem' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Subtotal: ${editSubtotal.toLocaleString('es-CL')}</div>
                  {editBillingType === 'con_boleta' && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>IVA: ${editIva.toLocaleString('es-CL')}</div>}
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Total: ${editGrandTotal.toLocaleString('es-CL')}</div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Notas / Condiciones</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} style={{ ...s, resize: 'vertical', fontSize: '0.8rem' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
                  <button onClick={handleSaveItems} disabled={saving || editItems.some(i => !i.description.trim())} className="btn btn-primary btn-sm" style={{ opacity: saving ? 0.5 : 1 }}>
                    {saving ? 'Guardando...' : <><Check size={14} /> Guardar cambios</>}
                  </button>
                  <button onClick={() => setEditingItems(false)} className="btn btn-outline btn-sm"><X size={14} /> Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions + Info */}
        <div className="bento-col-7">
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Acciones</h3>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {linkedOrderId ? (
                <Link href={`/nexus/work-orders/${linkedOrderId}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '1rem', padding: '0.55rem 1.2rem' }}>
                  <ExternalLink size={15} /> Seguimiento
                </Link>
              ) : quote.status === 'approved' && !linkedOrderId ? (
                <Link href={`/nexus/work-orders/new?quoteId=${id}`} className="btn btn-primary btn-sm" style={{ fontSize: '1rem', padding: '0.55rem 1.2rem' }}>Crear orden</Link>
              ) : null}
              {(quote.status === 'draft' || quote.status === 'sent') && (
                <button onClick={() => handleStatus(quote.status === 'draft' ? 'sent' : 'approved')} className="btn btn-primary btn-sm" style={{ background: quote.status === 'draft' ? '#3b82f6' : '#10b981', fontSize: '1rem', padding: '0.55rem 1.2rem' }}>
                  <Send size={15} /> {quote.status === 'draft' ? 'Marcar enviada' : 'Aprobar'}
                </button>
              )}
              {quote.status === 'sent' && (
                <button onClick={() => handleStatus('draft')} className="btn btn-outline btn-sm" style={{ fontSize: '1rem', padding: '0.55rem 1.2rem' }}>
                  <X size={15} /> Retroceder a Borrador
                </button>
              )}
              {quote.status === 'approved' && !linkedOrderId && (
                <button onClick={() => handleStatus('sent')} className="btn btn-outline btn-sm" style={{ fontSize: '1rem', padding: '0.55rem 1.2rem', color: '#f59e0b' }}>
                  <X size={15} /> Retroceder a Enviada
                </button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/quote/${id}`); alert('Link público copiado'); }} className="btn btn-outline btn-sm" style={{ fontSize: '1rem', padding: '0.55rem 1.2rem' }}>
                <ExternalLink size={13} /> Link público
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Informaci&oacute;n</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Creada</span><div>{quote.createdAt ? format(quote.createdAt, 'd MMM yyyy HH:mm', { locale: es }) : '—'}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Vence</span><div>{quote.validUntil ? format(quote.validUntil, 'd MMM yyyy', { locale: es }) : '—'}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Facturaci&oacute;n</span><div>{quote.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Estado</span><div style={{ fontWeight: 700, color: displayStatus.color }}>{displayStatus.label}</div></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const s: React.CSSProperties = {
  padding: '0.4rem 0.6rem', background: '#fff', border: '1.5px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
