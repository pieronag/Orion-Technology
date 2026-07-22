'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPublicEquipmentInfo, approveQuotePublic } from '@/app/actions/nexus/public';
import Image from 'next/image';
import { Wrench, CheckCircle2, Clock, Shield, Truck, Package, Search, FileText, FlaskConical, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WORK_ORDER_STATUSES } from '@/data/diagnosis-templates';
import { dedupeTimeline } from '@/lib/firestore-utils';

const STATUS_ICONS: Record<string, any> = {
  received: Package,
  diagnosing: Search,
  quoted: FileText,
  approved: CheckCircle2,
  repairing: Wrench,
  testing: FlaskConical,
  ready: CheckCheck,
  delivered: Truck,
};

export default function PublicEquipmentPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    const r = await getPublicEquipmentInfo(id as string);
    if (r.success) setData(r);
    else setError(r.error || 'Error');
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!data?.currentOrder?.id) return;
    setApproving(true);
    const r = await approveQuotePublic(id as string);
    if (r.success) load();
    setApproving(false);
  };

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </main>
  );

  if (error === 'not_found') return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Equipo no encontrado</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>El código de equipo no es válido o ha sido eliminado.</p>
      </div>
    </main>
  );

  if (error) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ef4444' }}>Error al cargar información</p>
    </main>
  );

  const equipment = data.equipment;
  const order = data.currentOrder;
  const statusDef = WORK_ORDER_STATUSES.find(s => s.id === order?.status);
  const StatusIcon = statusDef ? STATUS_ICONS[statusDef.id] || Wrench : Wrench;

  return (
    <main style={{ minHeight: '100vh', background: '#f8f8fa', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .public-header { background: linear-gradient(135deg, #7c3aed, #0891b2); color: #fff; padding: 2rem 0; text-align: center; }
        .public-card { background: #fff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
      `}</style>

      <div className="public-header">
        <Image src="/logo_white.png" alt="Orion Technology" width={120} height={40} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
          Estado de tu equipo
        </h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Equipment info */}
        <div className="public-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={24} style={{ color: '#0891b2' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{equipment.brand} {equipment.model}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {equipment.type} · {equipment.clientName}
                {equipment.serialNumber && ` · ${equipment.serialNumber}`}
              </p>
            </div>
          </div>
          {equipment.photos?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem' }}>
              {equipment.photos.slice(0, 3).map((url: string, i: number) => (
                <img key={i} src={url} alt="" style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Current status */}
        {order ? (
          <div className="public-card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${statusDef?.color || '#888'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {StatusIcon && <StatusIcon size={28} style={{ color: statusDef?.color }} />}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado actual</div>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: statusDef?.color }}>{statusDef?.label}</h3>
              </div>
            </div>

            {/* Timeline */}
            {order.timeline?.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Historial</h4>
                <div style={{ position: 'relative', paddingLeft: '14px' }}>
                  <div style={{ position: 'absolute', left: '4px', top: '4px', bottom: '4px', width: '2px', background: 'rgba(0,0,0,0.06)' }}></div>
                  {dedupeTimeline(order.timeline).map((t: any) => {
                    const sDef = WORK_ORDER_STATUSES.find((s: any) => s.id === t.status);
                    return (
                      <div key={t.status} style={{ position: 'relative', paddingBottom: '0.5rem', paddingLeft: '0.8rem' }}>
                        <span style={{ position: 'absolute', left: '-11px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: sDef?.color || '#888', border: '2px solid #fff', zIndex: 1 }}></span>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{sDef?.label || t.status}</div>
                        {t.note && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.note}</div>}
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{format(t.date, 'd MMM yyyy HH:mm', { locale: es })}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="public-card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sin órdenes de trabajo activas.</p>
          </div>
        )}

        {/* Warranty */}
        {order?.warranty && order.warranty.expiresAt && (
          <div className="public-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>En garantía</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Válida hasta {format(order.warranty.expiresAt, 'd MMM yyyy', { locale: es })} ({order.warranty.days} días)
              </div>
            </div>
          </div>
        )}

        {/* Approve button (if quoted) */}
        {order?.status === 'quoted' && (
          <button onClick={handleApprove} disabled={approving} className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', background: '#10b981', opacity: approving ? 0.5 : 1 }}>
            {approving ? 'Aprobando...' : '✅ Aprobar cotización'}
          </button>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1.5rem', opacity: 0.6, fontWeight: 600 }}>
          Orion Technology &copy; {new Date().getFullYear()} · Servicio técnico
        </p>
      </div>
    </main>
  );
}
