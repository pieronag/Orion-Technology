'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createWorkOrder } from '@/app/actions/nexus/work-orders';
import { uploadEquipmentPhoto, createEquipment } from '@/app/actions/nexus/equipments';
import { createClient } from '@/app/actions/nexus/clients';
import { getQuote } from '@/app/actions/nexus/quotes';
import { getClients, ClientData } from '@/app/actions/nexus/clients';
import { getEquipments, EquipmentData } from '@/app/actions/nexus/equipments';
import Link from 'next/link';
import { ArrowLeft, Camera, X, Check, Plus } from 'lucide-react';
import { Suspense } from 'react';
import { EQUIPMENT_TYPES } from '@/data/diagnosis-templates';

function NewWorkOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');

  const [clients, setClients] = useState<ClientData[]>([]);
  const [equipments, setEquipments] = useState<EquipmentData[]>([]);
  const [clientId, setClientId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [diagnosis, setDiagnosis] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [branch, setBranch] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [technicians, setTechnicians] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  // Inline creation
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', rut: '', phone: '', billingType: 'sin_boleta' as const });
  const [creatingClient, setCreatingClient] = useState(false);
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [newEquip, setNewEquip] = useState({ type: 'pc', brand: '', model: '', serialNumber: '' });
  const [creatingEquip, setCreatingEquip] = useState(false);

  useEffect(() => {
    const savedTechs = localStorage.getItem('nexus-technicians');
    const savedBranches = localStorage.getItem('nexus-branches');
    if (savedTechs) setTechnicians(JSON.parse(savedTechs));
    if (savedBranches) setBranches(JSON.parse(savedBranches));
  }, []);

  const loadData = () => Promise.all([getClients(), getEquipments()]).then(([cr, er]) => {
    if (cr.success && cr.clients) setClients(cr.clients);
    if (er.success && er.equipments) setEquipments(er.equipments);
  });

  useEffect(() => {
    loadData();
    if (quoteId) {
      getQuote(quoteId).then(r => {
        if (r.success && r.quote) {
          setClientId(r.quote.clientId);
          setEquipmentId(r.quote.equipmentId);
          setTotalAmount(r.quote.grandTotal || 0);
        }
      });
    }
  }, [quoteId]);

  const filteredEquipments = equipments.filter(e => !clientId || e.clientId === clientId);
  const selectedEquipment = equipments.find(e => e.id === equipmentId);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotos(prev => [...prev, ev.target?.result as string]); };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return;
    setCreatingClient(true);
    const r = await createClient(newClient);
    if (r.success) {
      await loadData();
      setClientId(r.id);
      setShowNewClient(false);
      setNewClient({ name: '', rut: '', phone: '', billingType: 'sin_boleta' });
    }
    setCreatingClient(false);
  };

  const handleCreateEquipment = async () => {
    if (!newEquip.brand.trim() || !newEquip.model.trim() || !clientId) return;
    setCreatingEquip(true);
    const r = await createEquipment({
      clientId,
      type: newEquip.type,
      brand: newEquip.brand,
      model: newEquip.model,
      serialNumber: newEquip.serialNumber,
      accessories: [],
      photos: [],
      diagnosisResults: {},
    });
    if (r.success) {
      await loadData();
      setEquipmentId(r.id);
      setShowNewEquipment(false);
      setNewEquip({ type: 'pc', brand: '', model: '', serialNumber: '' });
    }
    setCreatingEquip(false);
  };

  const handleSave = async () => {
    if (!equipmentId) return;
    setSaving(true);
    setError('');

    try {
      const r = await createWorkOrder({
        equipmentId,
        clientId: clientId || '',
        status: 'received',
        assignedTo: assignedTo || '',
        branch: branch || '',
        diagnosis: diagnosis || '',
        repairNotes: '',
        billingType: clients.find(c => c.id === clientId)?.billingType || 'sin_boleta',
        totalAmount,
        paymentStatus: 'pending',
        warrantyClaim: false,
        warranty: null,
        timeline: [{ status: 'received', date: Date.now(), note: 'Orden creada', by: 'Admin' }],
        quoteId: quoteId || undefined,
      });

      if (!r.success) {
        setError(r.error || 'Error al crear la orden');
        setSaving(false);
        return;
      }

      const orderId = r.id;
      for (const photo of photos) {
        const base64 = photo.split(',')[1];
        if (base64) await uploadEquipmentPhoto(equipmentId, base64);
      }

      setSuccess(true);
      router.push(`/nexus/work-orders/${orderId}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Error inesperado');
      setSaving(false);
    }
  };

  if (success) return null;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) { .btn-nuevo { width: 30% !important; } }`}</style>
      <Link href="/nexus/work-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver
      </Link>

      <h1 style={{ marginBottom: '1rem' }}>Nueva orden de trabajo</h1>

      {error && (
        <div style={{ padding: '0.6rem 0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem' }}>{error}</div>
      )}

      <div className="bento-grid">
        <div className="bento-col-6">
          {/* Cliente */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <h3 style={{ fontSize: '0.85rem', margin: 0 }}>Cliente</h3>
              <button type="button" onClick={() => setShowNewClient(!showNewClient)} className="btn btn-outline btn-sm btn-nuevo" style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.1rem', padding: '0.2rem 0.5rem' }}><Plus size={11} /> Nuevo</button>
            </div>
            {!showNewClient ? (
              <select value={clientId} onChange={e => { setClientId(e.target.value); setEquipmentId(''); }} style={s}>
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px' }}>
                <input placeholder="Nombre *" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} style={s} autoFocus />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  <input placeholder="RUT" value={newClient.rut} onChange={e => setNewClient({ ...newClient, rut: e.target.value })} style={s} />
                  <input placeholder="Teléfono" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} style={s} />
                </div>
                <select value={newClient.billingType} onChange={e => setNewClient({ ...newClient, billingType: e.target.value as any })} style={s}>
                  <option value="sin_boleta">Sin boleta</option>
                  <option value="con_boleta">Con boleta</option>
                </select>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button type="button" onClick={handleCreateClient} disabled={creatingClient || !newClient.name.trim()} className="btn btn-primary btn-sm" style={{ opacity: creatingClient || !newClient.name.trim() ? 0.5 : 1 }}>
                    {creatingClient ? 'Creando...' : 'Crear y seleccionar'}
                  </button>
                  <button type="button" onClick={() => setShowNewClient(false)} className="btn btn-outline btn-sm">Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Equipo */}
          {clientId && (
            <div className="card" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '0.85rem', margin: 0 }}>Equipo</h3>
                <button type="button" onClick={() => setShowNewEquipment(!showNewEquipment)} className="btn btn-outline btn-sm btn-nuevo" style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.1rem', padding: '0.2rem 0.5rem' }}><Plus size={11} /> Nuevo</button>
              </div>
              {!showNewEquipment ? (
                <select value={equipmentId} onChange={e => setEquipmentId(e.target.value)} style={s}>
                  <option value="">Seleccionar equipo...</option>
                  {filteredEquipments.map(e => <option key={e.id} value={e.id}>{e.brand} {e.model} {e.serialNumber ? `(${e.serialNumber})` : ''}</option>)}
                </select>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    <select value={newEquip.type} onChange={e => setNewEquip({ ...newEquip, type: e.target.value })} style={s}>
                      {EQUIPMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input placeholder="Marca *" value={newEquip.brand} onChange={e => setNewEquip({ ...newEquip, brand: e.target.value })} style={s} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    <input placeholder="Modelo *" value={newEquip.model} onChange={e => setNewEquip({ ...newEquip, model: e.target.value })} style={s} />
                    <input placeholder="N° Serie" value={newEquip.serialNumber} onChange={e => setNewEquip({ ...newEquip, serialNumber: e.target.value })} style={s} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button type="button" onClick={handleCreateEquipment} disabled={creatingEquip || !newEquip.brand.trim() || !newEquip.model.trim()} className="btn btn-primary btn-sm" style={{ opacity: creatingEquip || !newEquip.brand.trim() || !newEquip.model.trim() ? 0.5 : 1 }}>
                      {creatingEquip ? 'Creando...' : 'Crear y seleccionar'}
                    </button>
                    <button type="button" onClick={() => setShowNewEquipment(false)} className="btn btn-outline btn-sm">Cancelar</button>
                  </div>
                </div>
              )}
              {selectedEquipment && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {(selectedEquipment.type || '').toUpperCase()} · {selectedEquipment.brand} {selectedEquipment.model} {selectedEquipment.serialNumber ? `· ${selectedEquipment.serialNumber}` : ''}
                </div>
              )}
            </div>
          )}

          {/* Fotos + Diagnóstico */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>Fotos del equipo</h3>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={11} /></button>
                </div>
              ))}
              <label style={{ width: '64px', height: '64px', borderRadius: '8px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.5rem', gap: '0.1rem' }}>
                <Camera size={15} /> Foto
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>Diagnóstico</h3>
            <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={3} style={{ ...s, resize: 'vertical' }} placeholder="Describe el problema reportado..." />
          </div>
        </div>

        <div className="bento-col-6">
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Asignación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.12rem' }}>Técnico</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={s}>
                  <option value="">Sin asignar</option>
                  {technicians.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.12rem' }}>Sucursal</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} style={s}>
                  <option value="">Sin sucursal</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !equipmentId} className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', opacity: saving || !equipmentId ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            {saving ? <><div className="spinner" /> Creando orden...</> : <><Check size={16} /> Crear orden de trabajo</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewWorkOrderPage() {
  return <Suspense><NewWorkOrderForm /></Suspense>;
}

const s: React.CSSProperties = {
  padding: '0.45rem 0.65rem', background: '#fff', border: '1.5px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '100%',
};
