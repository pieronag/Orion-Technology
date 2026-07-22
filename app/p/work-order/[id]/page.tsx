'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPublicWorkOrderInfo } from '@/app/actions/nexus/public';
import Image from 'next/image';
import { Wrench, CheckCircle2, Shield, Truck, Package, Search, FileText, FlaskConical, CheckCheck, Clock, Monitor, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';

const STATUS_ICONS: Record<string, any> = {
  received: Package, diagnosing: Search, quoted: FileText, approved: CheckCircle2,
  repairing: Wrench, testing: FlaskConical, ready: CheckCheck, delivered: Truck,
};

export default function PublicWorkOrderPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    const r = await getPublicWorkOrderInfo(id as string);
    if (r.success) setData(r);
    else setError(r.error || 'Error');
    setLoading(false);
  };

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="mesh-bg"></div>
      <div className="spinner" />
    </main>
  );

  if (error === 'not_found') return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div className="mesh-bg"></div>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Package size={24} color="#dc2626" />
        </div>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Orden no encontrada</h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>El enlace no es válido o la orden fue eliminada.</p>
      </div>
    </main>
  );

  if (error) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="mesh-bg"></div>
      <p style={{ color: '#dc2626' }}>Error al cargar información</p>
    </main>
  );

  const { order, equipment, clientName } = data;
  const statusDef = WORK_ORDER_STATUSES.find((s: any) => s.id === order.status);
  const statusIndex = WORK_ORDER_STATUSES.findIndex((s: any) => s.id === order.status);
  const StatusIcon = statusDef ? STATUS_ICONS[statusDef.id] || Wrench : Wrench;

  return (
    <main style={{ minHeight: '100vh', fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
      <div className="mesh-bg"></div>
      <style>{`
        .pw-header { background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #e5e7eb; padding: 1rem 0; position: sticky; top: 0; z-index: 10; }
        .pw-body { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }
        .pw-card { background: #fff; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid #e5e7eb; transition: box-shadow 0.2s; }
        .pw-step { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.35rem 0; position: relative; }
        .pw-step:not(:last-child)::before { content: ''; position: absolute; left: 13px; top: 30px; bottom: -10px; width: 2px; background: #e5e7eb; z-index: 0; }
        .pw-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; font-size: 0.5rem; font-weight: 800; position: relative; z-index: 1; }
        .pw-dot.pending { background: #f3f4f6; color: #9ca3af; }
        @media (max-width: 768px) {
          .pw-body { padding: 1rem 1rem 2rem; }
          .pw-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes pf { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pa { animation: pf 0.45s ease both; }
      `}</style>

      {/* Sticky header */}
      <div className="pw-header">
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image src="/logo_white.png" alt="Orion Technology" width={85} height={28} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} />
            <span style={{ width: '1px', height: '20px', background: '#e5e7eb' }}></span>
            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#6b7280' }}>{clientName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusDef?.color || '#888' }}></span>
            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: statusDef?.color || '#888' }}>{statusDef?.label}</span>
          </div>
        </div>
      </div>

      <div className="pw-body">
        {/* Hero status card */}
        <div className="pw-card pa" style={{ padding: '1.8rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${statusDef?.color || '#888'}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {StatusIcon && <StatusIcon size={32} style={{ color: statusDef?.color }} />}
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Estado de la reparación</div>
              <h2 style={{ fontSize: '1.6rem', margin: 0, color: statusDef?.color, fontWeight: 800 }}>{statusDef?.label}</h2>
              <div style={{ fontSize: '0.88rem', color: '#6b7280', marginTop: '0.15rem' }}>
                {equipment.brand} {equipment.model} · {(equipment.type || '').toUpperCase()}
                {equipment.serialNumber && <span> · {equipment.serialNumber}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.2rem', alignItems: 'start' }} className="pw-grid">
          
          {/* Left: Timeline */}
          <div className="pw-card pa" style={{ animationDelay: '0.05s', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <Clock size={17} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Progreso de la reparación</span>
            </div>
            <div style={{ paddingLeft: '2px' }}>
              {WORK_ORDER_STATUSES
                .filter((s: any) => order.timeline?.some((t: any) => t.status === s.id) || s.id === order.status)
                .map((s: any) => {
                const entry = order.timeline?.find((t: any) => t.status === s.id);
                return (
                  <div key={s.id} className="pw-step">
                    <div className={`pw-dot ${entry ? '' : 'pending'}`} style={{ background: entry ? s.color : '#f3f4f6' }}>
                      {entry ? <CheckCircle2 size={14} /> : <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>•</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: entry ? '#111827' : '#9ca3af' }}>{s.label}</div>
                      {entry?.note && <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.05rem', lineHeight: 1.4 }}>{entry.note}</div>}
                      {entry && <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.05rem' }}>{format(entry.date, 'd MMM yyyy HH:mm', { locale: es })}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Equipment card */}
            <div className="pw-card pa" style={{ animationDelay: '0.1s', padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <Monitor size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Equipo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                {[
                  ['Marca', equipment.brand],
                  ['Modelo', equipment.model],
                  ['Tipo', (equipment.type || '').toUpperCase()],
                  equipment.serialNumber ? ['Serie', equipment.serialNumber] : null,
                ].filter(Boolean).map((row: any) => (
                  <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.72rem' }}>{row[0]}</span>
                    <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{row[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fotos de ingreso */}
            {equipment.photos?.length > 0 && (
              <div className="pw-card pa" style={{ animationDelay: '0.125s', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <Camera size={15} style={{ color: '#6b7280' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>Fotos de ingreso</span>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {equipment.photos.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" onClick={() => setSelectedPhoto(url)} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Fotos post-reparación */}
            {order.afterPhotos?.length > 0 && (
              <div className="pw-card pa" style={{ animationDelay: '0.14s', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <Camera size={15} style={{ color: '#6b7280' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>Fotos post-reparaci&oacute;n</span>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {order.afterPhotos.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" onClick={() => setSelectedPhoto(url)} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e5e7eb', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            )}

            {order.diagnosis && (
              <div className="pw-card pa" style={{ animationDelay: '0.15s', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Diagnóstico</div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>{order.diagnosis}</div>
              </div>
            )}

            {order.repairNotes && (
              <div className="pw-card pa" style={{ animationDelay: '0.15s', padding: '1.2rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Trabajo realizado</div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>{order.repairNotes}</div>
              </div>
            )}

            {/* Warranty */}
            {order.warranty?.expiresAt && (
              <div className="pw-card pa" style={{ animationDelay: '0.15s', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={18} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#111827' }}>En garantía</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    Hasta el {format(order.warranty.expiresAt, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="pw-card pa" style={{ animationDelay: '0.2s', padding: '1.2rem', textAlign: 'center', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
              <p style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.6rem', fontWeight: 500 }}>¿Necesitas más información?</p>
              <a href={`https://wa.me/56950194398?text=Hola%2C%20consulta%20sobre%20mi%20reparaci%C3%B3n%3A%20${equipment.brand}%20${equipment.model}`}
                target="_blank" className="btn btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.78rem', padding: '0.45rem 1.1rem' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consultar
              </a>
            </div>
          </div>
        </div>

        {/* Photo modal */}
        {selectedPhoto && (
          <div onClick={() => setSelectedPhoto(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }}>
            <img src={selectedPhoto} alt="" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' }} />
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <Image src="/logo_white.png" alt="Orion" width={72} height={24} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)', opacity: 0.12, margin: '0 auto' }} />
          <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.3rem', fontWeight: 600 }}>Orion Technology &copy; {new Date().getFullYear()} · Servicio técnico</p>
        </div>
      </div>
    </main>
  );
}
