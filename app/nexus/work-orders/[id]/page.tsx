'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getWorkOrder, updateWorkOrderStatus, updateWorkOrder, uploadAfterPhoto, deleteAfterPhoto, deleteWorkOrder, WorkOrderData } from '@/app/actions/nexus/work-orders';
import { getWorkOrderPayments, createPayment, deletePayment, PaymentData } from '@/app/actions/nexus/payments';
import { getClient } from '@/app/actions/nexus/clients';
import { getEquipment, updateEquipment, uploadEquipmentPhoto, deleteEquipmentPhoto } from '@/app/actions/nexus/equipments';
import { getEquipmentQuotes, getQuote, QuoteData } from '@/app/actions/nexus/quotes';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Phone, Printer, Check, X, Plus, Trash2, History, Shield, Clock, Edit3, CheckCircle2, FileText, ExternalLink, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WORK_ORDER_STATUSES, PAYMENT_METHODS } from '@/data/diagnosis-templates';
import { dedupeTimeline, warrantyDaysLeft } from '@/lib/firestore-utils';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<WorkOrderData | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentPhotos, setEquipmentPhotos] = useState<string[]>([]);
  const [equipmentIdState, setEquipmentIdState] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [afterPhotoUploading, setAfterPhotoUploading] = useState(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card' | 'other'>('cash');

  const [warrantyDays, setWarrantyDays] = useState(30);
  const [statusNote, setStatusNote] = useState('');
  const [editingTotal, setEditingTotal] = useState(false);
  const [editTotalValue, setEditTotalValue] = useState(0);
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [editingRepairNotes, setEditingRepairNotes] = useState(false);
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editRepairNotes, setEditRepairNotes] = useState('');
  const [editingAssigned, setEditingAssigned] = useState(false);
  const [editAssigned, setEditAssigned] = useState('');
  const [editingBranch, setEditingBranch] = useState(false);
  const [editBranch, setEditBranch] = useState('');
  const [editTimelineStatus, setEditTimelineStatus] = useState<string | null>(null);
  const [editTimelineNote, setEditTimelineNote] = useState('');
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [showQuotePicker, setShowQuotePicker] = useState(false);

  useEffect(() => {
    const savedTechs = localStorage.getItem('nexus-technicians');
    const savedBranches = localStorage.getItem('nexus-branches');
    if (savedTechs) setTechnicians(JSON.parse(savedTechs));
    if (savedBranches) setBranches(JSON.parse(savedBranches));
  }, []);

  const handleSaveTotal = async () => {
    await updateWorkOrder(id as string, { totalAmount: editTotalValue });
    setEditingTotal(false);
    load();
  };

  const handleSaveField = async (field: string, value: any) => {
    await updateWorkOrder(id as string, { [field]: value });
    if (field === 'diagnosis') setEditingDiagnosis(false);
    if (field === 'repairNotes') setEditingRepairNotes(false);
    if (field === 'assignedTo') setEditingAssigned(false);
    if (field === 'branch') setEditingBranch(false);
    load();
  };

  const handleSaveTimelineNote = async () => {
    if (!editTimelineStatus || !order?.timeline) return;
    const updatedTimeline = order.timeline.map(t =>
      t.status === editTimelineStatus ? { ...t, note: editTimelineNote } : t
    );
    await updateWorkOrder(id as string, { timeline: updatedTimeline } as any);
    setEditTimelineStatus(null);
    load();
  };

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    const [or, pr] = await Promise.all([getWorkOrder(id as string), getWorkOrderPayments(id as string)]);
    if (or.success && or.order) {
      setOrder(or.order);
      const [cr, er] = await Promise.all([getClient(or.order.clientId), getEquipment(or.order.equipmentId)]);
      if (cr.success) { setClientName(cr.client?.name || ''); setClientPhone(cr.client?.phone || ''); }
      if (er.success) {
        setEquipmentName(`${er.equipment?.brand || ''} ${er.equipment?.model || ''}`);
        setEquipmentIdState(er.equipment?.id || or.order.equipmentId);
        setEquipmentPhotos(er.equipment?.photos || []);
        const qr = await getEquipmentQuotes(er.equipment?.id || or.order.equipmentId);
        if (qr.success && qr.quotes) {
          const approved = qr.quotes.filter(q => q.status === 'approved');
          setQuotes(approved);
          if (or.order.quoteId) {
            const sq = approved.find(q => q.id === or.order.quoteId) || qr.quotes.find(q => q.id === or.order.quoteId);
            if (sq) setSelectedQuote(sq);
          } else if (approved.length > 0) {
            setSelectedQuote(approved[0]);
          }
        }
      }
    }
    if (pr.success) setPayments(pr.payments);
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !equipmentIdState) return;
    setPhotoUploading(true);

    const img = new Image();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const max = 800;
          if (w > max || h > max) { const ratio = Math.min(max / w, max / h); w *= ratio; h *= ratio; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

    const base64 = dataUrl.split(',')[1];
    if (base64) {
      await uploadEquipmentPhoto(equipmentIdState, base64);
      setEquipmentPhotos(prev => [...prev, dataUrl]);
    }
    setPhotoUploading(false);
  };

  const handleAfterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAfterPhotoUploading(true);
    const img = new Image();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const max = 800;
          if (w > max || h > max) { const ratio = Math.min(max / w, max / h); w *= ratio; h *= ratio; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(',')[1];
    if (base64) {
      await uploadAfterPhoto(id as string, base64);
      setOrder(prev => prev ? { ...prev, afterPhotos: [...(prev.afterPhotos || []), dataUrl] } : prev);
    }
    setAfterPhotoUploading(false);
  };

  const handleAfterPhotoDelete = async (idx: number) => {
    await deleteAfterPhoto(id as string, idx);
    setOrder(prev => prev ? { ...prev, afterPhotos: (prev.afterPhotos || []).filter((_, i) => i !== idx) } : prev);
  };

  const handlePhotoDelete = async (idx: number) => {
    if (!equipmentIdState) return;
    await deleteEquipmentPhoto(equipmentIdState, idx);
    setEquipmentPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateWorkOrderStatus(id as string, newStatus, statusNote);
    if (newStatus === 'delivered' && warrantyDays > 0) {
      const expiresAt = Date.now() + warrantyDays * 86400000;
      await updateWorkOrder(id as string, { warranty: { days: warrantyDays, expiresAt } });
    }
    setStatusNote('');
    load();
  };

  const handleCancelOrder = async () => {
    if (!confirm('¿Finalizar esta orden como "Devuelto sin reparación"?')) return;
    await updateWorkOrderStatus(id as string, 'cancelled', statusNote || 'Orden finalizada sin reparación');
    setStatusNote('');
    load();
  };

  const handleDeleteOrder = async () => {
    if (!confirm('¿Eliminar permanentemente esta orden? Esta acción no se puede deshacer.')) return;
    await deleteWorkOrder(id as string);
    router.push('/nexus/work-orders');
    router.refresh();
  };

  const handleSelectQuote = async (quote: QuoteData) => {
    setSelectedQuote(quote);
    setShowQuotePicker(false);
    const tag = `#${String(quote.quoteNumber).padStart(4, '0')}`;
    const updatedTimeline = (order?.timeline || []).map(t =>
      t.status === 'quoted' && !t.note?.includes(tag)
        ? { ...t, note: t.note ? `${t.note} | Cotización ${tag} asociada` : `Cotización ${tag} asociada` }
        : t
    );
    const updateData: any = { quoteId: quote.id, totalAmount: quote.grandTotal };
    if (updatedTimeline.length > 0) updateData.timeline = updatedTimeline;
    await updateWorkOrder(id as string, updateData);
    load();
  };

  const handleAddPayment = async () => {
    if (paymentAmount <= 0) return;
    await createPayment({ workOrderId: id as string, clientId: order?.clientId || '', amount: paymentAmount, method: paymentMethod, date: Date.now() });
    setPaymentAmount(0);
    setShowPaymentForm(false);
    load();
  };

  const handleDeletePayment = async (paymentId: string) => {
    await deletePayment(paymentId, id as string);
    load();
  };



  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (!order) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Orden no encontrada</div>;

  const statusDef = WORK_ORDER_STATUSES.find(s => s.id === order.status);
  const statusIndex = WORK_ORDER_STATUSES.findIndex(s => s.id === order.status);
  const nextStatus = WORK_ORDER_STATUSES[statusIndex + 1];
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (order.totalAmount || 0) - totalPaid;
  const inWarranty = order.warranty?.expiresAt && warrantyDaysLeft(order.warranty.expiresAt) > 0;

  return (
    <div>
      <Link href="/nexus/work-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver a kanban
      </Link>

      <div className="bento-grid">
        {/* Left: Info + Status */}
        <div className="bento-col-5">
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{equipmentName}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{clientName}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.7rem', borderRadius: '20px', background: `${statusDef?.color}15`, color: statusDef?.color, fontWeight: 700, fontSize: '0.75rem' }}>
                  {statusDef?.label}
                </span>
                {inWarranty && <div style={{ marginTop: '0.3rem', fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>🛡 {warrantyDaysLeft(order.warranty!.expiresAt!)} d&iacute;as de garant&iacute;a restantes</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {clientPhone && (
                <Link href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=Hola%20${clientName}%2C%20te%20informamos%20que%20tu%20${equipmentName}%20est%C3%A1%20en%20estado%3A%20${statusDef?.label}`} target="_blank" className="btn btn-outline btn-sm" style={{ color: '#25D366', fontSize: '0.7rem' }}>
                  <Phone size={12} /> WhatsApp
                </Link>
              )}
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/work-order/${id}`); alert('Link público copiado al portapapeles'); }} className="btn btn-outline btn-sm" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                🔗 Link público
              </button>
              {order.deliveryNoteUrl && (
                <a href={order.deliveryNoteUrl} target="_blank" className="btn btn-outline btn-sm" style={{ fontSize: '0.7rem' }}><Printer size={12} /> Boleta entrega</a>
              )}
            </div>
          </div>

          {/* Fotos del equipo */}
          {equipmentPhotos.length > 0 && (
            <div className="card" style={{ marginBottom: '0.75rem', padding: '0.8rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Fotos del equipo</span>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {equipmentPhotos.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                    <img src={url} alt="" onClick={() => setSelectedPhoto(url)}
                      style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--border)' }} />
                    <button onClick={(e) => { e.stopPropagation(); handlePhotoDelete(i); }}
                      style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label style={{ width: '64px', height: '64px', borderRadius: '8px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.55rem', gap: '0.1rem' }}>
                  <Camera size={14} />
                  {photoUploading ? '...' : 'Agregar'}
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={photoUploading} />
                </label>
              </div>
            </div>
          )}
          {equipmentPhotos.length === 0 && (
            <div className="card" style={{ marginBottom: '0.75rem', padding: '0.8rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Fotos</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '2px dashed var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'inherit' }}>
                <Camera size={14} />
                {photoUploading ? 'Subiendo...' : 'Agregar fotos'}
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={photoUploading} />
              </label>
            </div>
          )}

          {selectedPhoto && (
            <div onClick={() => setSelectedPhoto(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }}>
              <img src={selectedPhoto} alt="" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }} />
            </div>
          )}

          {/* Info editable */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Técnico</span>
                {editingAssigned ? (
                  <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', marginTop: '0.15rem' }}>
                    <select value={editAssigned} onChange={e => setEditAssigned(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '0.25rem 0.4rem', fontSize: '0.8rem' }} autoFocus>
                      <option value="">Sin asignar</option>
                      {technicians.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => handleSaveField('assignedTo', editAssigned)} className="btn-icon" style={{ color: '#10b981' }}><Check size={13} /></button>
                    <button onClick={() => setEditingAssigned(false)} className="btn-icon"><X size={13} /></button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}
                    onClick={() => { setEditAssigned(order.assignedTo || ''); setEditingAssigned(true); }}>
                    {order.assignedTo || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>Sin asignar</span>}
                    <Edit3 size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  </div>
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sucursal</span>
                {editingBranch ? (
                  <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', marginTop: '0.15rem' }}>
                    <select value={editBranch} onChange={e => setEditBranch(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '0.25rem 0.4rem', fontSize: '0.8rem' }} autoFocus>
                      <option value="">Sin sucursal</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <button onClick={() => handleSaveField('branch', editBranch)} className="btn-icon" style={{ color: '#10b981' }}><Check size={13} /></button>
                    <button onClick={() => setEditingBranch(false)} className="btn-icon"><X size={13} /></button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}
                    onClick={() => { setEditBranch(order.branch || ''); setEditingBranch(true); }}>
                    {order.branch || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>Sin sucursal</span>}
                    <Edit3 size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnosis editable */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnóstico</span>
              {!editingDiagnosis && <button onClick={() => { setEditDiagnosis(order.diagnosis || ''); setEditingDiagnosis(true); }} className="btn-icon" style={{ color: 'var(--text-muted)' }} title="Editar"><Edit3 size={14} /></button>}
            </div>
            {editingDiagnosis ? (
              <div>
                <textarea value={editDiagnosis} onChange={e => setEditDiagnosis(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: '0.8rem' }} autoFocus />
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                  <button onClick={() => handleSaveField('diagnosis', editDiagnosis)} className="btn btn-primary btn-sm">Guardar</button>
                  <button onClick={() => setEditingDiagnosis(false)} className="btn btn-outline btn-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: order.diagnosis ? 'var(--text)' : 'var(--text-muted)' }}>
                {order.diagnosis || '—'}
              </div>
            )}
          </div>

          {/* Repair notes editable */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trabajo realizado</span>
              {!editingRepairNotes && <button onClick={() => { setEditRepairNotes(order.repairNotes || ''); setEditingRepairNotes(true); }} className="btn-icon" style={{ color: 'var(--text-muted)' }} title="Editar"><Edit3 size={14} /></button>}
            </div>
            {editingRepairNotes ? (
              <div>
                <textarea value={editRepairNotes} onChange={e => setEditRepairNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: '0.8rem' }} autoFocus />
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                  <button onClick={() => handleSaveField('repairNotes', editRepairNotes)} className="btn btn-primary btn-sm">Guardar</button>
                  <button onClick={() => setEditingRepairNotes(false)} className="btn btn-outline btn-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: order.repairNotes ? 'var(--text)' : 'var(--text-muted)' }}>
                {order.repairNotes || '—'}
              </div>
            )}
          </div>

          {/* Fotos post-reparación */}
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Fotos post-reparaci&oacute;n</span>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
              {(order.afterPhotos || []).map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                  <img src={url} alt="" onClick={() => setSelectedPhoto(url)}
                    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--border)' }} />
                  <button onClick={(e) => { e.stopPropagation(); handleAfterPhotoDelete(i); }}
                    style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label style={{ width: '64px', height: '64px', borderRadius: '8px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.55rem', gap: '0.1rem' }}>
                <Camera size={14} />
                {afterPhotoUploading ? '...' : 'Agregar'}
                <input type="file" accept="image/*" capture="environment" onChange={handleAfterPhotoUpload} style={{ display: 'none' }} disabled={afterPhotoUploading} />
              </label>
            </div>
          </div>

          {/* Payments */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} /> Pagos
              </h3>
              <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="btn btn-primary btn-sm"><Plus size={13} /> Registrar pago</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                {editingTotal ? (
                  <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                    <input type="number" value={editTotalValue} onChange={e => setEditTotalValue(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: '100px', padding: '0.2rem 0.4rem', fontWeight: 700 }} autoFocus />
                    <button onClick={handleSaveTotal} className="btn-icon" style={{ color: '#10b981' }}><Check size={14} /></button>
                    <button onClick={() => setEditingTotal(false)} className="btn-icon"><X size={14} /></button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => { setEditTotalValue(order.totalAmount || 0); setEditingTotal(true); }}
                    title="Editar total">
                    ${(order.totalAmount || 0).toLocaleString('es-CL')}
                    <Edit3 size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pagado</span><div style={{ fontWeight: 800, color: '#10b981' }}>${totalPaid.toLocaleString('es-CL')}</div></div>
              <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Saldo</span><div style={{ fontWeight: 800, color: balance > 0 ? '#ef4444' : '#10b981' }}>${balance.toLocaleString('es-CL')}</div></div>
            </div>

            {showPaymentForm && (
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-accent)', borderRadius: '6px' }}>
                <input type="number" placeholder="Monto" value={paymentAmount || ''} onChange={e => setPaymentAmount(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: '120px' }} />
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} style={{ ...inputStyle, width: 'auto', fontSize: '0.75rem' }}>
                  {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <button onClick={handleAddPayment} disabled={paymentAmount <= 0} className="btn btn-primary btn-sm">+</button>
                <button onClick={() => setShowPaymentForm(false)} className="btn-ghost btn-sm"><X size={14} /></button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {payments.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.5rem', background: 'var(--bg-accent)', borderRadius: '4px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>${p.amount.toLocaleString('es-CL')}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.7rem' }}>{PAYMENT_METHODS.find(m => m.id === p.method)?.label || p.method}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{format(p.date, 'd MMM HH:mm', { locale: es })}</span>
                    <button onClick={() => handleDeletePayment(p.id!)} className="btn-icon" style={{ color: '#ef4444' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {payments.length === 0 && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sin pagos registrados</p>}
            </div>
          </div>

        </div>

        {/* Right: Estados + Garantía */}
        <div className="bento-col-7">

          {/* Timeline / Estados */}
          <div className="card" style={{ marginBottom: '0.75rem', padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <Clock size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Estados</span>
            </div>
            <div style={{ paddingLeft: '2px' }}>
              <style>{`.wo-step { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.35rem 0; position: relative; }
.wo-step:not(:last-child)::before { content: ''; position: absolute; left: 13px; top: 30px; bottom: -10px; width: 2px; background: #e5e7eb; z-index: 0; }
.wo-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; font-size: 0.5rem; font-weight: 800; position: relative; z-index: 1; }
.wo-dot.pending { background: #f3f4f6; color: #9ca3af; }`}</style>
              {WORK_ORDER_STATUSES.map((s, idx) => {
                const timelineEntry = dedupeTimeline(order.timeline || []).find(t => t.status === s.id);
                const isDone = !!timelineEntry;
                const isCurrent = s.id === order.status;
                return (
                  <div key={s.id} className="wo-step">
                    <div className={`wo-dot ${isDone ? '' : 'pending'}`} style={{ background: isDone ? s.color : '#f3f4f6', border: isCurrent ? `3px solid ${s.color}` : 'none' }}>
                      {isDone ? <CheckCircle2 size={14} /> : <span style={{ fontSize: '0.65rem' }}>{idx + 1}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: isDone ? '#111827' : '#9ca3af' }}>{s.label}</div>
                      {timelineEntry && editTimelineStatus === s.id ? (
                        <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'flex-start', marginTop: '0.05rem' }}>
                          <input value={editTimelineNote} onChange={e => setEditTimelineNote(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.72rem' }} autoFocus placeholder="Nota..." />
                          <button onClick={handleSaveTimelineNote} className="btn-icon" style={{ color: '#10b981', width: '28px', height: '28px' }}><Check size={12} /></button>
                          <button onClick={() => setEditTimelineStatus(null)} className="btn-icon" style={{ width: '28px', height: '28px' }}><X size={12} /></button>
                        </div>
                      ) : timelineEntry?.note ? (
                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.05rem', lineHeight: 1.4, cursor: 'pointer' }}
                          onClick={() => { setEditTimelineStatus(s.id); setEditTimelineNote(timelineEntry.note || ''); }}>
                          {timelineEntry.note} <Edit3 size={10} style={{ opacity: 0.3, display: 'inline', verticalAlign: 'middle' }} />
                        </div>
                      ) : timelineEntry ? (
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', fontStyle: 'italic', cursor: 'pointer', marginTop: '0.05rem' }}
                          onClick={() => { setEditTimelineStatus(s.id); setEditTimelineNote(''); }}>
                          + Agregar nota
                        </div>
                      ) : null}
                      {timelineEntry && (
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.05rem' }}>{format(timelineEntry.date, 'd MMM yyyy HH:mm', { locale: es })}</div>
                      )}
                      {!isDone && !timelineEntry && (
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', opacity: 0.5, fontStyle: 'italic' }}>Pendiente</div>
                      )}

                      {/* Quote picker inside "Cotizado" step */}
                      {s.id === 'quoted' && (
                        <div style={{ marginTop: '0.3rem' }}>
                          {quotes.length === 0 ? (
                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontStyle: 'italic' }}>Sin cotizaciones para este equipo</div>
                          ) : (
                            <div>
                              {selectedQuote && !showQuotePicker ? (
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    <FileText size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>#{String(selectedQuote.quoteNumber).padStart(4, '0')}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>${(selectedQuote.grandTotal || 0).toLocaleString('es-CL')}</span>
                                    <span className={`badge ${selectedQuote.status === 'approved' ? 'badge-green' : selectedQuote.status === 'sent' ? 'badge-blue' : ''}`} style={{ fontSize: '0.5rem' }}>
                                      {selectedQuote.status === 'sent' ? 'Enviada' : selectedQuote.status === 'approved' ? 'Aprobada' : selectedQuote.status}
                                    </span>
                                    <span className="badge" style={{ fontSize: '0.5rem' }}>{selectedQuote.billingType === 'con_boleta' ? 'C/boleta' : 'S/boleta'}</span>
                                  </div>
                                  {selectedQuote.sentAt && (
                                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                      Enviada el {format(selectedQuote.sentAt, 'd MMM yyyy HH:mm', { locale: es })}
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                    <button onClick={() => setShowQuotePicker(true)} className="btn-ghost btn-sm" style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, padding: '0.15rem 0.3rem' }}>Cambiar</button>
                                    <Link href={`/nexus/quotes/${selectedQuote.id}`} style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Ver →</Link>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {quotes.map(q => (
                                    <button key={q.id} onClick={() => handleSelectQuote(q)}
                                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.4rem', borderRadius: '6px', border: selectedQuote?.id === q.id ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: selectedQuote?.id === q.id ? 'var(--primary-soft)' : 'var(--bg-accent)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.72rem', width: '100%' }}>
                                      <span style={{ fontWeight: 700 }}>#{String(q.quoteNumber).padStart(4, '0')}</span>
                                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${(q.grandTotal || 0).toLocaleString('es-CL')}</span>
                                      <span className={`badge ${q.status === 'approved' ? 'badge-green' : q.status === 'sent' ? 'badge-blue' : ''}`} style={{ fontSize: '0.5rem' }}>
                                        {q.status === 'approved' ? 'Aprobada' : q.status === 'sent' ? 'Enviada' : q.status}
                                      </span>
                                    </button>
                                  ))}
                                  {selectedQuote && <button onClick={() => setShowQuotePicker(false)} className="btn-ghost btn-sm" style={{ fontSize: '0.65rem', padding: '0.15rem 0.3rem' }}>✕ Cerrar</button>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>



          {/* Control de estados */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusDef?.color, display: 'inline-block' }}></span>
              Estado actual: <span style={{ color: statusDef?.color }}>{statusDef?.label}</span>
            </h3>
            <textarea
              placeholder={
                order.status === 'received' ? 'Ej: Equipo recibido, se procede con diagnóstico...' :
                order.status === 'diagnosing' ? 'Ej: Falla detectada, se requiere X reparación...' :
                order.status === 'quoted' ? 'Ej: Cotización enviada al cliente, esperando aprobación...' :
                order.status === 'approved' ? 'Ej: Cliente aprobó, se inicia reparación...' :
                order.status === 'repairing' ? 'Ej: Reparación en proceso, se reemplazó X componente...' :
                order.status === 'testing' ? 'Ej: Pruebas de funcionamiento exitosas...' :
                order.status === 'ready' ? 'Ej: Equipo listo, pendiente de retiro...' :
                'Nota opcional...'
              }
              value={statusNote} onChange={e => setStatusNote(e.target.value)} rows={2}
              style={{ ...inputStyle, marginBottom: '0.4rem', resize: 'vertical', fontSize: '0.8rem' }}
            />
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
              {statusIndex > 0 && (
                <button onClick={() => handleStatusChange(WORK_ORDER_STATUSES[statusIndex - 1].id)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} /> Retroceder a {WORK_ORDER_STATUSES[statusIndex - 1].label}
                </button>
              )}
              {nextStatus && (
                <button onClick={() => handleStatusChange(nextStatus.id)} className="btn btn-primary btn-sm" style={{ background: nextStatus.color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ChevronRight size={14} /> Avanzar a {nextStatus.label}
                </button>
              )}
              {nextStatus?.id === 'delivered' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Garantía:</span>
                  <select value={warrantyDays} onChange={e => setWarrantyDays(parseInt(e.target.value))} style={{ ...inputStyle, width: '60px', padding: '0.25rem', fontSize: '0.7rem' }}>
                    <option value={0}>Sin</option>
                    <option value={15}>15d</option>
                    <option value={30}>30d</option>
                    <option value={60}>60d</option>
                    <option value={90}>90d</option>
                  </select>
                </div>
              )}
            </div>

            {/* Actions: Cancel + Delete */}
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button onClick={handleCancelOrder} className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.7rem' }}>
                  <X size={13} /> Devuelto sin reparación
                </button>
              )}
              <button onClick={handleDeleteOrder} className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.7rem' }}>
                <Trash2 size={13} /> Eliminar orden
              </button>
            </div>
          </div>

          {/* Warranty info */}
          {order.warranty && (
            <div className="card" style={{ marginTop: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Shield size={14} /> Garantía
              </h3>
              <div style={{ fontSize: '0.8rem' }}>
                {order.warranty.days > 0 ? (
                  <span>
                    {order.warranty.days} días
                    {order.warranty.expiresAt && (
                      warrantyDaysLeft(order.warranty.expiresAt) > 0
                        ? ` — ${warrantyDaysLeft(order.warranty.expiresAt)} días restantes (expira ${format(order.warranty.expiresAt, 'd MMM yyyy', { locale: es })})`
                        : ` — Expirada (venció ${format(order.warranty.expiresAt, 'd MMM yyyy', { locale: es })})`
                    )}
                  </span>
                ) : 'Sin garantía'}
                {order.warrantyClaim && <span className="badge badge-orange" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>Reclamo activo</span>}
              </div>
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
