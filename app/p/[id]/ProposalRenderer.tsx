'use client';

import { useState, useRef } from 'react';
import { acceptProposal } from '@/app/actions/proposals';
import { CheckCircle2, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import BackToTop from '@/components/BackToTop';
import type { ProposalContent } from '@/lib/proposal-helpers';
import PDFContent from '@/components/PDFContent';

export default function ProposalRenderer({ data, proposalInfo, files, onAccepted }: { data: ProposalContent | any; proposalInfo: any; files?: any[]; onAccepted?: () => void }) {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(proposalInfo.status === 'accepted');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  if ((data as any)._raw) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ maxWidth: "800px", padding: "2rem", whiteSpace: "pre-wrap" }}>{(data as any)._raw}</div></main>;
  }

  const p = data as ProposalContent;
  const hasComparative = p.comparativeAnalysis?.trim();
  const hasIntegration = p.integration?.trim();
  const hasDifferentiators = p.differentiators?.length > 0;
  const hasMarketing = p.marketing?.length > 0;
  const hasMockups = p.mockups?.length > 0;
  const hasAuthor = p.authorName || p.authorRole;
  const hasFiles = files && files.length > 0;

  const handleAccept = async () => {
    setAccepting(true);
    const res = await acceptProposal(proposalInfo.id);
    if (res.success) { setAccepted(true); onAccepted?.(); }
    setAccepting(false);
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const el = pdfRef.current;
      el.style.display = 'block';
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: el.scrollHeight,
        windowWidth: 794,
        windowHeight: el.scrollHeight,
      });
      el.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = 210;
      const pageH = 297;
      const margin = 10;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;
      const imgRatio = canvas.width / canvas.height;
      let drawW = usableW;
      let drawH = drawW / imgRatio;

      let yOffset = 0;
      while (yOffset < canvas.height) {
        if (yOffset > 0) pdf.addPage();
        const remainingH = canvas.height - yOffset;
        const pageCanvasH = (usableH / drawW) * canvas.width;
        const sliceH = Math.min(pageCanvasH, remainingH);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const sliceData = sliceCanvas.toDataURL('image/png');
        pdf.addImage(sliceData, 'PNG', margin, margin, usableW, (sliceH / canvas.width) * usableW);
        yOffset += sliceH;
      }
      pdf.save(`propuesta-${p.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    }
    setPdfLoading(false);
  };

  const sectionTitle = (text: string) => (
    <h2 style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.02em", margin: "2.5rem 0 1rem", paddingBottom: "0.5rem", borderBottom: "2px solid var(--primary)", color: "var(--text)" }}>
      {text}
    </h2>
  );

  return (
    <main>
      <div className="mesh-bg"></div>

      {/* Fixed Header */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", padding: "0.6rem 0", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--glass-border)", zIndex: 50 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Image src="/logo_white.png" alt="Orion Logo" width={85} height={28} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} priority />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

            <a href={`https://wa.me/?text=${encodeURIComponent(`Propuesta para ${p.clientName}: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`} target="_blank" rel="noreferrer" style={{ padding: "0.35rem 0.7rem", fontSize: "0.7rem", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", textDecoration: "none", borderRadius: "6px", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ExternalLink size={13} /> Compartir
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mod-table, .mod-table thead, .mod-table tbody, .mod-table tfoot, .mod-table tr { display: block; }
          .mod-table thead { display: none; }
          .mod-table tr { margin-bottom: 1rem; border: 1px solid #e4e4e7; border-radius: 8px; padding: 0.6rem; }
          .mod-table td { display: block; padding: 0.25rem 0 !important; border: none !important; width: 100% !important; }
          .mod-table .td-name > div { display: flex !important; flex-direction: row !important; justify-content: space-between; align-items: center; padding-bottom: 0.3rem; margin-bottom: 0.3rem; border-bottom: 1px solid #f0f0f2; width: 100%; }
          .mod-table .td-name-inner { font-weight: 700; }
          .mod-table .td-price { color: #059669; font-weight: 700; font-size: 0.85rem !important; text-align: right !important; white-space: nowrap !important; }
          .mod-table .td-desc { color: var(--text-muted); font-size: 0.8rem; line-height: 1.5; width: 100%; }
          .mod-table tfoot tr { border-top: 2px solid #059669 !important; margin-top: 0.5rem; display: flex; justify-content: space-between; width: 100%; }
          .mod-table tfoot td { display: inline; padding: 0.5rem 0 !important; border: none !important; width: auto !important; }
        }
      `}</style>

      {/* Content wrapper for PDF capture */}
      <div ref={contentRef} style={{ paddingTop: "4.5rem", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "820px", margin: "0 auto", padding: "0 2rem" }}>
          {/* HERO */}
          <div style={{ textAlign: "center", padding: "2.5rem 0 1.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary)", marginBottom: "1rem" }}>PROPUESTA DE TRANSFORMACIÓN DIGITAL</p>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "900", letterSpacing: "-0.03em", lineHeight: "1.15", marginBottom: "0.5rem" }}>{p.title}</h1>
            {p.subtitle && <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: "1.5", maxWidth: "650px", margin: "0 auto 0.8rem" }}>{p.subtitle}</p>}
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--primary)" }}>{p.clientName}</strong>
              {hasAuthor && <><span style={{ margin: "0 0.4rem", opacity: 0.3 }}>|</span>{p.authorRole ? `${p.authorName} — ${p.authorRole}` : p.authorName}</>}
            </div>
          </div>

          {/* INTRODUCCIÓN */}
          <section>
            {sectionTitle('Introducción y Objetivos')}
            <div style={{ fontSize: "0.9rem", lineHeight: "1.8", color: "var(--text)", whiteSpace: "pre-wrap", textAlign: "justify" }}>
              {p.introObjectives}
            </div>
          </section>

          {/* DESARROLLO */}
          {p.developmentGroups?.map((group, gIdx) => (
            <section key={gIdx}>
              {sectionTitle(group.title)}
              {group.description && <p style={{ fontSize: "0.9rem", lineHeight: "1.7", color: "var(--text-muted)", marginBottom: "1rem", textAlign: "justify" }}>{group.description}</p>}
              {group.modules?.length > 0 && (
                <table className="mod-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e4e4e7" }}>
                      <th style={{ padding: "0.5rem 0.6rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.7rem", textTransform: "uppercase", width: "30%" }}>Módulo / Inversión</th>
                      <th style={{ padding: "0.5rem 0.6rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.7rem", textTransform: "uppercase" }}>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.modules.map((mod, mIdx) => (
                      <tr key={mIdx} style={{ borderBottom: "1px solid #f0f0f2" }}>
                        <td className="td-name" style={{ padding: "0.6rem", fontWeight: "700", verticalAlign: "top", width: "30%" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span className="td-name-inner">{mod.name}</span>
                            <span className="td-price" style={{ fontWeight: "700", color: "#059669", fontSize: "0.9rem", whiteSpace: "nowrap" }}>{mod.investment}</span>
                          </div>
                        </td>
                        <td className="td-desc" style={{ padding: "0.6rem", color: "var(--text-muted)", lineHeight: "1.6", verticalAlign: "top", textAlign: "justify" }}>{mod.description}</td>
                      </tr>
                    ))}
                  </tbody>
                  {(group.subtotal || group.timeline) && (
                    <tfoot>
                      <tr style={{ borderTop: "2px solid #059669" }}>
                        <td style={{ padding: "0.6rem", fontWeight: "700", fontSize: "0.85rem" }}>{group.timeline ? `Subtotal — ${group.timeline}` : 'Subtotal'}</td>
                        <td style={{ padding: "0.6rem", textAlign: "right", fontWeight: "900", color: "#059669", fontSize: "1rem", whiteSpace: "nowrap" }}>{group.subtotal}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </section>
          ))}

          {/* ANÁLISIS COMPARATIVO */}
          {hasComparative && (
            <section>
              {sectionTitle('Análisis Comparativo')}
              <div style={{ fontSize: "0.9rem", lineHeight: "1.8", color: "var(--text-muted)", whiteSpace: "pre-wrap", textAlign: "justify" }}>{p.comparativeAnalysis}</div>
            </section>
          )}

          {/* INTEGRACIÓN */}
          {hasIntegration && (
            <section>
              {sectionTitle('Análisis de Integración')}
              <div style={{ fontSize: "0.9rem", lineHeight: "1.8", color: "var(--text-muted)", textAlign: "justify" }}>{p.integration}</div>
            </section>
          )}

          {/* DIFERENCIADORES */}
          {hasDifferentiators && (
            <section>
              {sectionTitle('Valor Agregado')}
              {p.differentiators.map((diff, idx) => (
                <div key={idx} style={{ marginBottom: "1rem", padding: "0 0 0.8rem 1rem", borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "900", fontSize: "1rem", color: "#f59e0b", flexShrink: 0 }}>{diff.label}.</span>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "700", margin: 0 }}>{diff.title}</h3>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6", margin: "0.3rem 0 0", paddingLeft: "1.5rem", textAlign: "justify" }}>{diff.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* MARKETING */}
          {hasMarketing && (
            <section>
              {sectionTitle('Estrategia de Marketing')}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e4e4e7" }}>
                    <th style={{ padding: "0.5rem 0.6rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.7rem", textTransform: "uppercase", width: "18%" }}>Plan</th>
                    <th style={{ padding: "0.5rem 0.6rem", textAlign: "left", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.7rem", textTransform: "uppercase" }}>Descripción</th>
                    <th style={{ padding: "0.5rem 0.6rem", textAlign: "right", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.7rem", textTransform: "uppercase", width: "14%" }}>Inversión</th>
                  </tr>
                </thead>
                <tbody>
                  {p.marketing.map((mkt, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f0f0f2" }}>
                      <td style={{ padding: "0.6rem", fontWeight: "700" }}>{mkt.name}</td>
                      <td style={{ padding: "0.6rem", color: "var(--text-muted)", lineHeight: "1.5", textAlign: "justify" }}>{mkt.description}</td>
                      <td style={{ padding: "0.6rem", textAlign: "right", fontWeight: "700", color: "#059669", whiteSpace: "nowrap" }}>{mkt.investment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* MOCKUPS */}
          {hasMockups && (
            <section>
              {sectionTitle('Mockups de Referencia')}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                {p.mockups.map((mock, idx) => (
                  <div key={idx} style={{ cursor: "pointer" }} onClick={() => setLightboxImg(mock.url)}>
                    <div style={{ width: "100%", height: "180px", background: "var(--bg-accent)", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                      <img src={mock.url} alt={mock.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    {mock.caption && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem", textAlign: "center" }}>{mock.caption}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ARCHIVOS ADJUNTOS */}
          {hasFiles && (
            <section>
              {sectionTitle('Archivos Adjuntos')}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {files!.map((f: any, idx: number) => (
                  <a key={idx} href={f.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.7rem", borderRadius: "6px", border: "1px solid var(--glass-border)", textDecoration: "none", color: "var(--text)", fontWeight: "600", fontSize: "0.8rem" }}>
                    <Download size={14} color="var(--primary)" /> {f.name}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* COMERCIAL */}
          <section style={{ marginTop: "2rem", paddingBottom: "1rem" }}>
            {sectionTitle('Condiciones Comerciales')}

            <div style={{ border: "2px solid #059669", borderRadius: "8px", padding: "1.2rem", marginBottom: "1.5rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Inversión Total</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "900", color: "#059669", margin: 0 }}>{p.commercial.total}</p>
              {p.commercial.timeline && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{p.commercial.timeline}</p>}
            </div>

            {p.commercial.payment?.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "0.5rem" }}>Esquema de Pago</h3>
                {p.commercial.payment.map((pay, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f2" }}>
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <span style={{ fontSize: "0.85rem" }}>{pay.description}</span>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.15rem" }}>
                        {pay.percentage && <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--primary)" }}>{pay.percentage}</span>}
                        {pay.amount && <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#059669", whiteSpace: "nowrap" }}>{pay.amount}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {p.commercial.intellectualProperty && (
              <div style={{ marginBottom: "0.8rem" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "0.2rem" }}>Propiedad Intelectual</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", margin: 0, textAlign: "justify" }}>{p.commercial.intellectualProperty}</p>
              </div>
            )}

            {p.commercial.warranty && (
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "0.2rem" }}>Garantía y Soporte</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", margin: 0, textAlign: "justify" }}>{p.commercial.warranty}</p>
              </div>
            )}
          </section>

          {/* FIRMA DIGITAL */}
          <section style={{ padding: "2rem 0", borderTop: "1px solid var(--glass-border)", textAlign: "center", marginTop: "1.5rem" }}>
            {accepted ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={24} color="#059669" />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#059669", margin: 0 }}>Propuesta Aceptada</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Gracias por tu confianza. Nos pondremos en contacto para comenzar.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "800", marginBottom: "0.3rem" }}>¿Estás de acuerdo con esta propuesta?</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.8rem" }}>Al aceptar, confirmas los términos y condiciones descritos.</p>
                <button onClick={handleAccept} disabled={accepting} className="btn btn-primary" style={{ padding: "0.6rem 1.8rem", fontSize: "0.85rem" }}>
                  {accepting ? 'Aceptando...' : 'Aceptar Propuesta'}
                </button>
              </>
            )}
          </section>
        </div>
      </div>

      {lightboxImg && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
        </div>
      )}

      <footer style={{ padding: "2rem 0", textAlign: "center", borderTop: "1px solid var(--glass-border)" }}>
        <Image src="/logo_white.png" alt="Orion Logo" width={90} height={30} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)', margin: "0 auto 0.3rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Sistemas de Inteligencia y Eficiencia Operativa de Precisión</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", marginTop: "1rem", opacity: 0.5 }}>© 2026. Todos los derechos reservados.</p>
      </footer>
      <BackToTop />

      {/* PDF Content - hidden, captured by html2canvas */}
      <div ref={pdfRef} style={{ position: 'fixed', left: '-9999px', top: 0, width: 794, background: '#fff' }}>
        <PDFContent data={p} files={files} />
      </div>
    </main>
  );
}
