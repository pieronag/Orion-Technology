'use client';

import { useState, useEffect } from 'react';
import { getQuoteTemplates, getQuote, QuoteData } from '@/app/actions/nexus/quotes';
import Link from 'next/link';
import { FileText, ArrowLeft, Copy } from 'lucide-react';

export default function QuoteTemplatesPage() {
  const [templates, setTemplates] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuoteTemplates().then(r => {
      if (r.success) setTemplates(r.templates);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando plantillas...</div>;

  return (
    <div>
      <Link href="/nexus/quotes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Volver a cotizaciones
      </Link>
      <h1 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}><FileText size={22} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} /> Plantillas de cotización</h1>

      <div className="bento-grid">
        {templates.length === 0 ? (
          <div className="bento-col-12 card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No hay plantillas guardadas. Crea una cotización y guárdala como plantilla.</p>
            <Link href="/nexus/quotes/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Nueva cotización</Link>
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="bento-col-4 card" style={{ cursor: 'pointer' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{t.templateName || 'Sin nombre'}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>{t.items?.length || 0} items · Total: ${(t.grandTotal || 0).toLocaleString('es-CL')}</div>
                <div>{t.billingType === 'con_boleta' ? 'Con boleta' : 'Sin boleta'}</div>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem' }}>
                <Link href={`/nexus/quotes/new?template=${t.id}`} className="btn btn-primary btn-sm" style={{ fontSize: '0.7rem' }}>
                  <Copy size={12} /> Usar plantilla
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
