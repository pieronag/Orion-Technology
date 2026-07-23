'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { createEquipment, uploadEquipmentPhoto } from '@/app/actions/nexus/equipments';
import { createWorkOrder } from '@/app/actions/nexus/work-orders';
import { EQUIPMENT_TYPES, DIAGNOSIS_TEMPLATES, DiagnosisTemplate } from '@/data/diagnosis-templates';
import Link from 'next/link';
import { ArrowLeft, Camera, X, Check, Search, Plus } from 'lucide-react';
import { Suspense } from 'react';

function NewEquipmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<ClientData[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(!preselectedClientId);
  const [newClientForm, setNewClientForm] = useState(false);

  const [form, setForm] = useState({
    clientId: preselectedClientId || '',
    type: 'pc',
    brand: '',
    model: '',
    serialNumber: '',
    accessories: [] as string[],
    condition: '',
    password: '',
    notes: '',
  });
  const [accessoryInput, setAccessoryInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [template, setTemplate] = useState<DiagnosisTemplate | null>(null);
  const [diagnosisResults, setDiagnosisResults] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { getClients().then(r => { if (r.success && r.clients) setClients(r.clients); }); }, []);

  const selectedClient = clients.find(c => c.id === form.clientId);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotos(prev => [...prev, ev.target?.result as string]); };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const addAccessory = () => {
    if (accessoryInput.trim()) { setForm({ ...form, accessories: [...form.accessories, accessoryInput.trim()] }); setAccessoryInput(''); }
  };

  const handleSave = async () => {
    if (!form.clientId || !form.brand.trim()) return;
    setSaving(true);

    const equipmentResult = await createEquipment({
      ...form,
      diagnosisTemplateId: template?.id,
      diagnosisResults,
      photos: [],
    });

    if (!equipmentResult.success) { setSaving(false); return; }
    const equipmentId = equipmentResult.id!;

    for (const photo of photos) {
      const base64 = photo.split(',')[1];
      if (base64) await uploadEquipmentPhoto(equipmentId, base64);
    }

    await createWorkOrder({
      equipmentId,
      clientId: form.clientId,
      status: 'received',
      assignedTo: '',
      branch: '',
      diagnosis: template ? Object.entries(diagnosisResults).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
      repairNotes: '',
      timeline: [{ status: 'received', date: Date.now(), note: 'Equipo recibido en taller', by: 'Admin' }],
      warranty: null,
      warrantyClaim: false,
      billingType: selectedClient?.billingType || 'sin_boleta',
      totalAmount: 0,
      paymentStatus: 'pending',
    });

    router.push(`/nexus/equipments/${equipmentId}`);
    router.refresh();
  };

  const filteredClients = clients.filter(c =>
    !clientSearch || c.name?.toLowerCase().includes(clientSearch.toLowerCase()) || c.rut?.includes(clientSearch)
  );

  return (
    <div>
      <style>{`@media (max-width: 640px) {
        .eq-new-grid { grid-template-columns: 1fr !important; }
        .eq-new-fields { grid-template-columns: 1fr !important; }
        .eq-new-diagnosis input { width: 100% !important; }
        .eq-new-photo { width: 60px !important; height: 60px !important; }
        .eq-new-btn { font-size: 0.82rem !important; padding: 0.5rem 1rem !important; }
      }`}</style>
      <Link href="/nexus/equipments" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'inherit', marginBottom: '0.75rem' }}>
        <ArrowLeft size={14} /> Volver
      </Link>

      <h1 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Nuevo equipo</h1>

      <div className="bento-grid eq-new-grid">
        <div className="bento-col-5">
          {/* Client selection */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>Cliente</h3>
            {selectedClient ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px' }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem' }}>{selectedClient.name}</span>
                <span className={`badge ${selectedClient.billingType === 'con_boleta' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: '0.6rem' }}>{selectedClient.billingType === 'con_boleta' ? 'Boleta' : 'S/Boleta'}</span>
                <button onClick={() => { setForm({ ...form, clientId: '' }); setShowClientPicker(true); }} className="btn-ghost btn-sm" style={{ color: '#ef4444' }}>Cambiar</button>
              </div>
            ) : (
              <div>
                {newClientForm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.6rem', background: 'var(--bg-accent)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Nuevo cliente</div>
                    <input placeholder="Nombre *" style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.65rem' }} autoFocus />
                    <input placeholder="RUT" style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.65rem' }} />
                    <input placeholder="Teléfono" style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.65rem' }} />
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem' }}>Guardar cliente</button>
                      <button type="button" onClick={() => setNewClientForm(false)} className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input placeholder="Buscar cliente (mín. 3 caracteres)..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} style={{ ...inputStyle, marginBottom: '0.3rem' }} />
                    {clientSearch.length >= 3 && (
                    <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.3rem' }}>
                      {filteredClients.map(c => (
                        <button key={c.id} type="button" onClick={() => { setForm({ ...form, clientId: c.id! }); setShowClientPicker(false); }}
                          style={{ textAlign: 'left', padding: '0.4rem 0.6rem', borderRadius: '4px', border: 'none', borderBottom: '1px solid var(--border-light)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', color: 'var(--text)', width: '100%' }}>
                          <strong>{c.name}</strong> {c.rut && <span style={{ color: 'var(--text-muted)' }}> · {c.rut}</span>}
                        </button>
                      ))}
                    </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                      <button type="button" onClick={() => setNewClientForm(true)} className="btn btn-primary btn-sm eq-new-btn"><Plus size={13} /> Nuevo cliente</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Equipment form */}
          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>Datos del equipo</h3>
            <div className="eq-new-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                {EQUIPMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <input placeholder="Marca" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={inputStyle} required />
              <input placeholder="Modelo" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} style={inputStyle} required />
              <input placeholder="N° Serie (opcional)" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} style={inputStyle} />
              <input placeholder="Contraseña (si aplica)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
              <input placeholder="Estado físico del equipo" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} style={inputStyle} />
            </div>

            {/* Accessories */}
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Accesorios recibidos</label>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                {form.accessories.map((a, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', background: 'var(--primary-glow)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {a} <button type="button" onClick={() => setForm({ ...form, accessories: form.accessories.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <input placeholder="Ej: Cargador, cable HDMI..." value={accessoryInput} onChange={e => setAccessoryInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAccessory())} style={{ ...inputStyle }} />
              <button type="button" onClick={addAccessory} className="btn btn-outline btn-sm eq-new-btn" style={{ marginTop: '0.2rem', width: '100%' }}>+ Agregar</button>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Notas de recepción</label>
              <textarea placeholder="Observaciones adicionales..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <div className="bento-col-7">
          {/* Photos */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>Fotos del equipo</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={12} /></button>
                </div>
              ))}
              <label className="eq-new-photo" style={{ width: '80px', height: '80px', borderRadius: '6px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.6rem', gap: '0.2rem' }}>
                <Camera size={18} />
                Foto
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Diagnosis template */}
          <div className="card eq-new-diagnosis">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>Checklist diagnóstico</h3>
            <select value={template?.id || ''} onChange={e => { const t = DIAGNOSIS_TEMPLATES.find(t => t.id === e.target.value); setTemplate(t || null); setDiagnosisResults({}); }}
              style={{ ...inputStyle, marginBottom: '0.5rem' }}>
              <option value="">Seleccionar plantilla...</option>
              {DIAGNOSIS_TEMPLATES.filter(t => t.equipmentTypes.includes(form.type)).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            {template && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {template.items.map(item => (
                  <div key={item.id} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.8rem' }}>
                      {item.type === 'check' ? (
                        <button type="button" onClick={() => setDiagnosisResults({ ...diagnosisResults, [item.id]: diagnosisResults[item.id] === 'ok' ? '' : 'ok' })}
                          style={{ width: '22px', height: '22px', borderRadius: '5px', border: `2px solid ${diagnosisResults[item.id] === 'ok' ? '#10b981' : '#d1d5db'}`, background: diagnosisResults[item.id] === 'ok' ? '#10b981' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#fff', transition: 'all 0.15s' }}>
                          {diagnosisResults[item.id] === 'ok' && <Check size={12} />}
                        </button>
                      ) : (
                        <span style={{ color: '#d1d5db', flexShrink: 0, marginTop: '1px' }}>—</span>
                      )}
                      <span style={{ flex: 1, color: diagnosisResults[item.id] === 'ok' ? 'var(--text-muted)' : 'var(--text)', textDecoration: diagnosisResults[item.id] === 'ok' ? 'line-through' : 'none' }}>{item.label}</span>
                    </div>
                    {(item.type === 'text' || item.type === 'value') && (
                      <input placeholder={item.type === 'value' ? 'Valor...' : 'Nota...'} value={diagnosisResults[item.id] || ''} onChange={e => setDiagnosisResults({ ...diagnosisResults, [item.id]: e.target.value })}
                        style={{ ...inputStyle, fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginTop: '0.25rem' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving || !form.clientId || !form.brand.trim()} className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.7rem', fontSize: '0.9rem', opacity: saving || !form.clientId || !form.brand.trim() ? 0.5 : 1 }}>
            {saving ? 'Guardando...' : 'Registrar equipo y crear orden'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewEquipmentPage() {
  return <Suspense><NewEquipmentForm /></Suspense>;
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.7rem', background: '#fff', border: '1px solid var(--glass-border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
