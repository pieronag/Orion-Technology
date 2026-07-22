'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import { createEquipment } from '@/app/actions/nexus/equipments';
import { createQuote, QuoteItem, QuoteData } from '@/app/actions/nexus/quotes';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import { EQUIPMENT_TYPES } from '@/data/diagnosis-templates';

export default function NewQuotePage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [billingType, setBillingType] = useState<'sin_boleta' | 'con_boleta'>('sin_boleta');
  const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, unitPrice: 0, type: 'labor' }]);
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(15);
  const [saving, setSaving] = useState(false);

  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [newEq, setNewEq] = useState({ type: 'pc', brand: '', model: '', serialNumber: '' });
  const [creatingEq, setCreatingEq] = useState(false);

  useEffect(() => {
    Promise.all([getClients(), getEquipments()]).then(([cr, er]) => {
      if (cr.success && cr.clients) setClients(cr.clients);
      if (er.success && er.equipments) setEquipments(er.equipments);
    });
  }, []);

  const clientEquipments = equipments.filter(e => e.clientId === selectedClientId);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const iva = billingType === 'con_boleta' ? subtotal * 0.19 : 0;
  const grandTotal = billingType === 'con_boleta' ? subtotal + iva : subtotal;

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0, type: 'labor' }]);
  const removeItem = (idx: number) => items.length > 1 && setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = value;
    setItems(newItems);
  };

  const handleCreateEquipment = async () => {
    if (!newEq.brand.trim() || !newEq.model.trim()) return;
    setCreatingEq(true);
    const r = await createEquipment({
      clientId: selectedClientId,
      type: newEq.type,
      brand: newEq.brand,
      model: newEq.model,
      serialNumber: newEq.serialNumber,
      accessories: [],
      photos: [],
      diagnosisResults: {},
    });
    if (r.success) {
      const er = await getEquipments();
      if (er.success && er.equipments) setEquipments(er.equipments);
      setSelectedEquipmentId(r.id);
      setShowNewEquipment(false);
      setNewEq({ type: 'pc', brand: '', model: '', serialNumber: '' });
    }
    setCreatingEq(false);
  };

  const handleSave = async () => {
    if (!selectedEquipmentId || items.some(i => !i.description.trim())) return;
    setSaving(true);

    const quoteData: Omit<QuoteData, 'id' | 'createdAt' | 'quoteNumber'> = {
      equipmentId: selectedEquipmentId,
      clientId: selectedClientId,
      status: 'draft',
      items,
      subtotal,
      billingType,
      ...(billingType === 'con_boleta' ? { iva, grandTotal } : { grandTotal: subtotal }),
      total: subtotal,
      notes,
      validUntil: Date.now() + validDays * 86400000,
    };

    const r = await createQuote(quoteData);
    if (r.success) {
      router.push(`/nexus/quotes/${r.id}`);
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div>
      <Link href="/nexus/quotes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver
      </Link>
      <h1 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Nueva cotización</h1>

      <div className="bento-grid">
        <div className="bento-col-6">
          {/* Client & Equipment */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>Cliente</h3>
            <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedEquipmentId(''); setShowNewEquipment(false); setBillingType(clients.find(c => c.id === e.target.value)?.billingType || 'sin_boleta'); }} style={inputStyle}>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.rut ? `(${c.rut})` : ''}</option>)}
            </select>
          </div>

          {selectedClientId && (
            <div className="card" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '0.85rem', margin: 0 }}>Equipo</h3>
                <button type="button" onClick={() => setShowNewEquipment(!showNewEquipment)} className="btn btn-outline btn-sm" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Plus size={12} /> Nuevo
                </button>
              </div>

              {!showNewEquipment ? (
                <select value={selectedEquipmentId} onChange={e => setSelectedEquipmentId(e.target.value)} style={inputStyle}>
                  <option value="">Seleccionar equipo...</option>
                  {clientEquipments.map(e => <option key={e.id} value={e.id}>{e.brand} {e.model} {e.serialNumber ? `(${e.serialNumber})` : ''}</option>)}
                </select>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    <select value={newEq.type} onChange={e => setNewEq({ ...newEq, type: e.target.value })} style={inputStyle}>
                      {EQUIPMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input placeholder="Marca" value={newEq.brand} onChange={e => setNewEq({ ...newEq, brand: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    <input placeholder="Modelo" value={newEq.model} onChange={e => setNewEq({ ...newEq, model: e.target.value })} style={inputStyle} />
                    <input placeholder="N° Serie (opcional)" value={newEq.serialNumber} onChange={e => setNewEq({ ...newEq, serialNumber: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button type="button" onClick={handleCreateEquipment} disabled={creatingEq || !newEq.brand.trim() || !newEq.model.trim()} className="btn btn-primary btn-sm" style={{ opacity: creatingEq || !newEq.brand.trim() || !newEq.model.trim() ? 0.5 : 1 }}>
                      {creatingEq ? 'Creando...' : 'Crear y seleccionar'}
                    </button>
                    <button type="button" onClick={() => setShowNewEquipment(false)} className="btn-ghost btn-sm">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', margin: 0 }}>Items</h3>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tipo facturación:</span>
                <select value={billingType} onChange={e => setBillingType(e.target.value as any)} style={{ ...inputStyle, width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  <option value="sin_boleta">Sin boleta</option>
                  <option value="con_boleta">Con boleta (+IVA)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <select value={item.type} onChange={e => updateItem(i, 'type', e.target.value)} style={{ ...inputStyle, width: '80px', fontSize: '0.7rem', padding: '0.3rem' }}>
                    <option value="labor">Mano obra</option>
                    <option value="part">Repuesto</option>
                  </select>
                  <input placeholder="Descripción" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={{ ...inputStyle, flex: 1, fontSize: '0.8rem' }} />
                  <input type="number" placeholder="Cant." value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} style={{ ...inputStyle, width: '50px', fontSize: '0.75rem', textAlign: 'center' }} />
                  <input type="number" placeholder="$ Unit." value={item.unitPrice || ''} onChange={e => updateItem(i, 'unitPrice', parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: '90px', fontSize: '0.75rem', textAlign: 'right' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', width: '70px', textAlign: 'right' }}>${(item.quantity * item.unitPrice).toLocaleString('es-CL')}</span>
                  <button type="button" onClick={() => removeItem(i)} className="btn-icon" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem} className="btn btn-outline btn-sm" style={{ marginTop: '0.4rem', width: '100%', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}><Plus size={14} /> Agregar item</button>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem', gap: '0.15rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'var(--text-muted)' }}>Subtotal:</span><span style={{ fontWeight: 700 }}>${subtotal.toLocaleString('es-CL')}</span></div>
              {billingType === 'con_boleta' && <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'var(--text-muted)' }}>IVA (19%):</span><span style={{ fontWeight: 700 }}>${iva.toLocaleString('es-CL')}</span></div>}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.3rem', marginTop: '0.15rem' }}>
                <span style={{ fontWeight: 700 }}>Total{billingType === 'con_boleta' ? ' (bruto)' : ''}:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>${grandTotal.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-col-6">
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Detalles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Vigencia (días)</label>
              <input type="number" value={validDays} onChange={e => setValidDays(Math.max(1, parseInt(e.target.value) || 1))} style={{ ...inputStyle, width: '80px' }} />
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Notas / condiciones</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Términos, condiciones de pago, garantía ofrecida..." />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !selectedEquipmentId || items.some(i => !i.description.trim())} className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem', opacity: saving || !selectedEquipmentId || items.some(i => !i.description.trim()) ? 0.5 : 1 }}>
            {saving ? 'Guardando...' : 'Crear cotización'}
          </button>

          {selectedClient?.billingType === 'sin_boleta' && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(245,158,11,0.08)', borderRadius: '6px', fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>
              💡 Este cliente es <strong>sin boleta</strong>. El total ingresado es el valor final a pagar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.7rem', background: '#fff', border: '1px solid var(--glass-border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
