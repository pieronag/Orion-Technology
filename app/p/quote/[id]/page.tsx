'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPublicQuoteInfo } from '@/app/actions/nexus/public';
import Image from 'next/image';
import { FileText, CheckCircle2, Clock, XCircle, Send, Monitor, Shield, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  draft: { color: '#6b7280', bg: '#f3f4f6', label: 'Borrador', icon: Clock },
  sent: { color: '#3b82f6', bg: '#eff6ff', label: 'Enviada', icon: Send },
  approved: { color: '#10b981', bg: '#f0fdf4', label: 'Aprobada', icon: CheckCircle2 },
  rejected: { color: '#ef4444', bg: '#fef2f2', label: 'Rechazada', icon: XCircle },
};

export default function PublicQuotePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [id]);

  const load = async () => {
    const r = await getPublicQuoteInfo(id as string);
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
          <FileText size={24} color="#dc2626" />
        </div>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Cotizaci&oacute;n no encontrada</h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>El enlace no es v&aacute;lido o la cotizaci&oacute;n fue eliminada.</p>
      </div>
    </main>
  );

  if (error) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="mesh-bg"></div>
      <p style={{ color: '#dc2626' }}>Error al cargar informaci&oacute;n</p>
    </main>
  );

  const { quote, equipment, clientName } = data;
  const config = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const StatusIcon = config.icon;

  return (
    <main style={{ minHeight: '100vh', fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
      <div className="mesh-bg"></div>
      <style>{`
        .pq-header { background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #e5e7eb; padding: 1rem 0; position: sticky; top: 0; z-index: 10; }
        .pq-body { max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }
        .pq-card { background: #fff; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid #e5e7eb; }
        @media (max-width: 640px) { .pq-body { padding: 1rem 1rem 2rem; } .grid-2 { grid-template-columns: 1fr !important; } .hide-mobile { display: none !important; } .total-col { flex: 1 !important; width: auto !important; text-align: right !important; } }
        @keyframes pf { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pa { animation: pf 0.45s ease both; }
      `}</style>

      {/* Header */}
      <div className="pq-header">
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image src="/logo_white.png" alt="Orion Technology" width={85} height={28} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} />
            <span style={{ width: '1px', height: '20px', background: '#e5e7eb' }}></span>
            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#6b7280' }}>{clientName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', borderRadius: '20px', background: config.bg }}>
            <StatusIcon size={14} style={{ color: config.color }} />
            <span style={{ fontWeight: 700, fontSize: '0.72rem', color: config.color }}>{config.label}</span>
          </div>
        </div>
      </div>

      <div className="pq-body">
        {/* Hero */}
        <div className="pq-card pa" style={{ padding: '1.5rem 1.8rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={28} style={{ color: '#7c3aed' }} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Cotizaci&oacute;n</div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>#{String(quote.quoteNumber).padStart(4, '0')}</h2>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.15rem' }}>
                {equipment.brand} {equipment.model} · {(equipment.type || '').toUpperCase()}
                {equipment.serialNumber && <span> · {equipment.serialNumber}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="pq-card pa" style={{ animationDelay: '0.05s', padding: '1.5rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280', marginBottom: '0.6rem' }}>Detalle</div>
          <div style={{ borderBottom: '2px solid #111827', paddingBottom: '0.3rem', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
            <span style={{ flex: 1 }}>Descripci&oacute;n</span>
            <span className="hide-mobile" style={{ width: '60px', textAlign: 'center' }}>Cant.</span>
            <span className="hide-mobile" style={{ width: '90px', textAlign: 'right' }}>P. Unit.</span>
            <span style={{ width: '90px', textAlign: 'right' }} className="total-col">Total</span>
          </div>
          {quote.items.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.82rem' }}>
              <span style={{ flex: 1 }}>
                {item.description}
                <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginLeft: '0.3rem' }}>
                  {item.type === 'labor' ? '🛠' : '🔧'}
                </span>
              </span>
              <span className="hide-mobile" style={{ width: '60px', textAlign: 'center', color: '#6b7280' }}>{item.quantity}</span>
              <span className="hide-mobile" style={{ width: '90px', textAlign: 'right', color: '#6b7280' }}>${item.unitPrice.toLocaleString('es-CL')}</span>
              <span className="total-col" style={{ width: '90px', textAlign: 'right', fontWeight: 700 }}>${(item.quantity * item.unitPrice).toLocaleString('es-CL')}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#6b7280' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>${quote.subtotal.toLocaleString('es-CL')}</span>
            </div>
            {quote.billingType === 'con_boleta' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ color: '#6b7280' }}>IVA (19%):</span>
                <span style={{ fontWeight: 600 }}>${(quote.iva || 0).toLocaleString('es-CL')}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '1.1rem', borderTop: '1px solid #111827', paddingTop: '0.3rem', marginTop: '0.1rem' }}>
              <span style={{ fontWeight: 700 }}>Total:</span>
              <span style={{ fontWeight: 800, color: '#7c3aed' }}>${quote.grandTotal.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Two column info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-2">
          {/* Equipment */}
          <div className="pq-card pa" style={{ animationDelay: '0.1s', padding: '1.2rem' }}>
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

          {/* Validez + Cliente */}
          <div className="pq-card pa" style={{ animationDelay: '0.15s', padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <Clock size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Informaci&oacute;n</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280', fontSize: '0.72rem' }}>Cliente</span>
                <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{clientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280', fontSize: '0.72rem' }}>Emisi&oacute;n</span>
                <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{quote.createdAt ? format(quote.createdAt, 'd MMM yyyy', { locale: es }) : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280', fontSize: '0.72rem' }}>V&aacute;lida hasta</span>
                <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{quote.validUntil ? format(quote.validUntil, 'd MMM yyyy', { locale: es }) : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '0.72rem' }}>Facturaci&oacute;n</span>
                <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{quote.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="pq-card pa" style={{ animationDelay: '0.2s', padding: '1.2rem', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Notas / Condiciones</div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>{quote.notes}</div>
          </div>
        )}

        {/* CTA WhatsApp */}
        <div className="pq-card pa" style={{ animationDelay: '0.25s', padding: '1.2rem', marginTop: '1rem', textAlign: 'center', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
          <p style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.6rem', fontWeight: 500 }}>¿Tienes dudas sobre esta cotizaci&oacute;n?</p>
          <a href={`https://wa.me/56950194398?text=Hola%2C%20consulta%20sobre%20mi%20cotizaci%C3%B3n%20%23${String(quote.quoteNumber).padStart(4, '0')}%3A%20${equipment.brand}%20${equipment.model}`}
            target="_blank" className="btn btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.78rem', padding: '0.45rem 1.1rem' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Image src="/logo_white.png" alt="Orion" width={72} height={24} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)', opacity: 0.12, margin: '0 auto' }} />
          <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.3rem', fontWeight: 600 }}>Orion Technology &copy; {new Date().getFullYear()} · Servicio t&eacute;cnico</p>
        </div>
      </div>
    </main>
  );
}
