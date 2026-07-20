'use client';

import type { ProposalContent } from '@/lib/proposal-helpers';

const A4W = 794;
const A4H = 1123;
const MARGIN = 48;
const CONTENT_W = A4W - MARGIN * 2;

const styles = {
  page: { width: A4W, padding: `${MARGIN}px`, background: '#fff', fontFamily: 'Outfit, sans-serif', color: '#0f0f13', lineHeight: 1.5 },
  title: { fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b6b80', marginBottom: 16 },
  clientLine: { fontSize: 11, color: '#6b6b80', marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 800, marginTop: 20, marginBottom: 8, borderBottom: '2px solid #7c3aed', paddingBottom: 4, color: '#0f0f13' },
  text: { fontSize: 10, lineHeight: 1.6, color: '#0f0f13', whiteSpace: 'pre-wrap' as const, marginBottom: 6 },
  mutedText: { fontSize: 10, lineHeight: 1.6, color: '#6b6b80' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 9, marginBottom: 8 },
  th: { padding: '4px 6px', textAlign: 'left' as const, color: '#6b6b80', fontWeight: 700, fontSize: 8, textTransform: 'uppercase' as const, borderBottom: '2px solid #e4e4e7' },
  td: { padding: '5px 6px', verticalAlign: 'top' as const, borderBottom: '1px solid #f0f0f2' },
  tdLabel: { fontWeight: 700, fontSize: 9 },
  tdDesc: { color: '#6b6b80', fontSize: 9, lineHeight: 1.5 },
  tdPrice: { textAlign: 'right' as const, fontWeight: 700, color: '#059669', fontSize: 9, whiteSpace: 'nowrap' as const },
  totalBox: { border: '2px solid #059669', borderRadius: 6, padding: '12px 16px', marginTop: 16, marginBottom: 12, textAlign: 'center' as const },
  totalLabel: { fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, color: '#6b6b80', marginBottom: 2 },
  totalValue: { fontSize: 22, fontWeight: 900, color: '#059669', margin: 0 },
  diffBlock: { marginBottom: 10, padding: '0 0 6px 10px', borderLeft: '3px solid #f59e0b' },
  diffLabel: { fontWeight: 900, fontSize: 12, color: '#f59e0b', marginRight: 4 },
  paymentRow: { display: 'flex' as const, gap: 6, padding: '4px 0', borderBottom: '1px solid #f0f0f2', marginBottom: 4 },
};

export default function PDFContent({ data, files }: { data: ProposalContent; files?: any[] }) {
  const p = data;
  const hasDiff = p.differentiators?.length > 0;
  const hasMkt = p.marketing?.length > 0;
  const hasMockups = p.mockups?.length > 0;
  const hasFiles = files && files.length > 0;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#7c3aed', marginBottom: 8 }}>PROPUESTA DE TRANSFORMACIÓN DIGITAL</p>
        <h1 style={styles.title}>{p.title}</h1>
        {p.subtitle && <p style={styles.subtitle}>{p.subtitle}</p>}
        <p style={styles.clientLine}><strong style={{ color: '#7c3aed' }}>{p.clientName}</strong>{p.authorName ? `  |  ${p.authorName}${p.authorRole ? ` — ${p.authorRole}` : ''}` : ''}</p>
      </div>

      {/* INTRO */}
      <h2 style={styles.sectionTitle}>1. Introducción y Objetivos</h2>
      <div style={styles.text}>{p.introObjectives}</div>

      {/* DEVELOPMENT */}
      {p.developmentGroups?.map((g, gi) => (
        <div key={gi}>
          <h2 style={styles.sectionTitle}>{`${gi + 2}. ${g.title}`}</h2>
          {g.description && <p style={styles.mutedText}>{g.description}</p>}
          {g.modules?.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr><th style={styles.th}>Módulo</th><th style={styles.th}>Descripción</th><th style={{ ...styles.th, textAlign: 'right', width: 80 }}>Inversión</th></tr>
              </thead>
              <tbody>
                {g.modules.map((m, mi) => (
                  <tr key={mi}>
                    <td style={{ ...styles.td, ...styles.tdLabel, width: 140 }}>{m.name}</td>
                    <td style={{ ...styles.td, ...styles.tdDesc }}>{m.description}</td>
                    <td style={{ ...styles.td, ...styles.tdPrice, width: 80 }}>{m.investment}</td>
                  </tr>
                ))}
              </tbody>
              {(g.subtotal || g.timeline) && (
                <tfoot>
                  <tr><td colSpan={2} style={{ padding: '5px 6px', fontWeight: 700, fontSize: 10, borderTop: '2px solid #059669' }}>{g.timeline ? `Subtotal — ${g.timeline}` : 'Subtotal'}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 900, color: '#059669', fontSize: 12, borderTop: '2px solid #059669' }}>{g.subtotal}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      ))}

      {/* COMPARATIVE */}
      {p.comparativeAnalysis?.trim() && (
        <><h2 style={styles.sectionTitle}>Análisis Comparativo</h2><div style={styles.text}>{p.comparativeAnalysis}</div></>
      )}

      {/* INTEGRATION */}
      {p.integration?.trim() && (
        <><h2 style={styles.sectionTitle}>Análisis de Integración</h2><div style={styles.text}>{p.integration}</div></>
      )}

      {/* DIFFERENTIATORS */}
      {hasDiff && (
        <><h2 style={styles.sectionTitle}>Valor Agregado</h2>
          {p.differentiators.map((d, i) => (
            <div key={i} style={styles.diffBlock}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={styles.diffLabel}>{d.label}.</span>
                <span style={{ fontWeight: 700, fontSize: 11 }}>{d.title}</span>
              </div>
              <p style={{ fontSize: 9, color: '#6b6b80', margin: '2px 0 0 16px', lineHeight: 1.5 }}>{d.description}</p>
            </div>
          ))}
        </>
      )}

      {/* MARKETING */}
      {hasMkt && (
        <><h2 style={styles.sectionTitle}>Estrategia de Marketing</h2>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Plan</th><th style={styles.th}>Descripción</th><th style={{ ...styles.th, textAlign: 'right', width: 80 }}>Inversión</th></tr></thead>
            <tbody>{p.marketing.map((m, i) => (
              <tr key={i}><td style={{ ...styles.td, fontWeight: 700, width: 120 }}>{m.name}</td><td style={{ ...styles.td, ...styles.tdDesc }}>{m.description}</td><td style={{ ...styles.td, ...styles.tdPrice, width: 80 }}>{m.investment}</td></tr>
            ))}</tbody>
          </table>
        </>
      )}

      {/* MOCKUPS */}
      {hasMockups && (
        <><h2 style={styles.sectionTitle}>Mockups de Referencia</h2>
          <p style={{ fontSize: 9, color: '#6b6b80' }}>Se incluyen {p.mockups.length} imagen(es) de referencia visual para el proyecto.</p>
        </>
      )}

      {/* FILES */}
      {hasFiles && (
        <><h2 style={styles.sectionTitle}>Archivos Adjuntos</h2>
          {files!.map((f: any, i: number) => (
            <div key={i} style={{ fontSize: 9, color: '#7c3aed', marginBottom: 2 }}>{f.name}</div>
          ))}
        </>
      )}

      {/* COMMERCIAL */}
      <h2 style={styles.sectionTitle}>Condiciones Comerciales</h2>
      <div style={styles.totalBox}>
        <p style={styles.totalLabel}>Inversión Total</p>
        <p style={styles.totalValue}>{p.commercial.total}</p>
        {p.commercial.timeline && <p style={{ fontSize: 9, color: '#6b6b80', marginTop: 4 }}>{p.commercial.timeline}</p>}
      </div>

      {p.commercial.payment?.length > 0 && (
        <><p style={{ fontSize: 10, fontWeight: 800, marginBottom: 4 }}>Esquema de Pago</p>
          {p.commercial.payment.map((pay, i) => (
            <div key={i} style={styles.paymentRow}>
              <span style={{ fontSize: 9, color: '#059669' }}>✓</span>
              <div>
                <span style={{ fontSize: 9 }}>{pay.description}</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 1 }}>
                  {pay.percentage && <span style={{ fontSize: 8, fontWeight: 700, color: '#7c3aed' }}>{pay.percentage}</span>}
                  {pay.amount && <span style={{ fontSize: 8, fontWeight: 700, color: '#059669' }}>{pay.amount}</span>}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {p.commercial.intellectualProperty && (
        <><p style={{ fontSize: 10, fontWeight: 800, marginTop: 8, marginBottom: 2 }}>Propiedad Intelectual</p>
          <p style={{ fontSize: 9, color: '#6b6b80', lineHeight: 1.5, margin: 0 }}>{p.commercial.intellectualProperty}</p>
        </>
      )}

      {p.commercial.warranty && (
        <><p style={{ fontSize: 10, fontWeight: 800, marginTop: 8, marginBottom: 2 }}>Garantía y Soporte</p>
          <p style={{ fontSize: 9, color: '#6b6b80', lineHeight: 1.5, margin: 0 }}>{p.commercial.warranty}</p>
        </>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid #e4e4e7', textAlign: 'center', fontSize: 7, color: '#a1a1aa' }}>
        Orion Technology — Documento generado digitalmente
      </div>
    </div>
  );
}
