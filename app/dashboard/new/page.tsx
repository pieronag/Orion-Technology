'use client';

import { useState, useEffect } from 'react';
import { createProposal } from '@/app/actions/proposals';
import { useRouter } from 'next/navigation';
import { defaultProposalTemplate } from '@/lib/proposal-template';
import { parseUF, sumModulesUF, sumPayments, autoLabel } from '@/lib/proposal-helpers';
import type { ProposalContent, ProposalModule, ProposalPayment } from '@/lib/proposal-helpers';
import MarkdownInput from '@/components/MarkdownInput';
import {
  Sparkles, KeyRound, User, FileText, Plus, Trash2, Settings, MonitorSmartphone, Code,
  DollarSign, ShieldCheck, Image, BarChart3, GitCompare, Puzzle, ChevronDown, ChevronUp, Tag,
} from 'lucide-react';

export default function NewProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [password, setPassword] = useState('');
  const [vigenciaDias, setVigenciaDias] = useState(15);
  const [data, setData] = useState<ProposalContent>({ ...defaultProposalTemplate, clientName: 'Maskota Center' });

  const [showComparative, setShowComparative] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);
  const [showDifferentiators, setShowDifferentiators] = useState(false);
  const [showMarketing, setShowMarketing] = useState(false);
  const [showMockups, setShowMockups] = useState(false);

  const set = (fn: (prev: ProposalContent) => ProposalContent) => setData(fn);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); document.querySelector('form')?.requestSubmit(); }
      if (e.key === 'Escape') { router.push('/dashboard'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!password) { setError('Debes ingresar una contraseña para la propuesta'); setLoading(false); return; }

    try {
      const result = await createProposal(
        { title: data.title, clientName: data.clientName, content: JSON.stringify(data) },
        password,
        vigenciaDias,
      );
      if (result.success) { router.push('/dashboard'); router.refresh(); }
      else { setError(result.error || 'Error al crear la propuesta'); }
    } catch { setError('Error interno al compilar la propuesta.'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "0.5rem 0.7rem", background: "#ffffff", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "#0f172a", fontSize: "0.85rem", fontFamily: "inherit" };
  const labelStyle = { display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.25rem" };
  const sectionHeaderStyle = { fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.7rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.6rem" };

  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .action-btns { display: flex; justify-content: flex-end; gap: 1rem; }
        .dynamic-item { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: var(--radius-md); border: 1px dashed var(--glass-border); margin-bottom: 0.75rem; position: relative; }
        .action-btns { display: flex; justify-content: flex-end; gap: 1rem; }
        .toggle-section { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem 0; font-size: 0.9rem; color: var(--text-muted); font-weight: 600; transition: 0.2s; }
        .toggle-section:hover { color: var(--text); }
        @media (max-width: 768px) { .action-btns { flex-direction: column; width: 100%; } .action-btns .btn { width: 100%; justify-content: center; } }
      `}} />
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", letterSpacing: "-0.03em", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
          Nueva Propuesta <Sparkles size={22} color="var(--primary)" />
        </h1>
        <p className="text-muted" style={{ fontSize: "0.95rem" }}>Completa los datos. El sistema compilará la propuesta automáticamente.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* BLOQUE 1: CONFIGURACIÓN BÁSICA */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><Settings size={22} color="var(--primary)" /> Configuración Básica</h2>
          <div className="bento-grid">
            <div className="bento-col-6">
              <label style={labelStyle}><User size={16} /> Nombre del Cliente</label>
              <input type="text" value={data.clientName} onChange={(e) => set(p => ({ ...p, clientName: e.target.value }))} style={inputStyle} required />
            </div>
            <div className="bento-col-3">
              <label style={labelStyle}><KeyRound size={16} /> Contraseña de Acceso</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>
            <div className="bento-col-3">
              <label style={labelStyle}><ShieldCheck size={16} /> Vigencia (días)</label>
              <input type="number" min={1} max={90} value={vigenciaDias} onChange={(e) => setVigenciaDias(Number(e.target.value))} style={inputStyle} required />
            </div>
            <div className="bento-col-12">
              <label style={labelStyle}><FileText size={16} /> Título de la Propuesta</label>
              <input type="text" value={data.title} onChange={(e) => set(p => ({ ...p, title: e.target.value }))} style={inputStyle} required />
            </div>
            <div className="bento-col-12">
              <label style={labelStyle}><FileText size={16} /> Subtítulo (opcional)</label>
              <input type="text" value={data.subtitle} onChange={(e) => set(p => ({ ...p, subtitle: e.target.value }))} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: AUTOR */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><User size={22} color="var(--secondary)" /> Datos del Autor</h2>
          <div className="bento-grid">
            <div className="bento-col-6">
              <label style={labelStyle}><User size={16} /> Nombre del Autor</label>
              <input type="text" value={data.authorName} onChange={(e) => set(p => ({ ...p, authorName: e.target.value }))} style={inputStyle} />
            </div>
            <div className="bento-col-6">
              <label style={labelStyle}><Code size={16} /> Cargo / Rol</label>
              <input type="text" value={data.authorRole} onChange={(e) => set(p => ({ ...p, authorRole: e.target.value }))} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* BLOQUE 3: TAGS */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><Tag size={18} color="var(--secondary)" /> Etiquetas</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
            {data.tags.map((tag, idx) => (
              <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", background: "var(--primary-glow)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700", color: "var(--primary)" }}>
                {tag}
                <button type="button" onClick={() => set(p => ({ ...p, tags: p.tags.filter((_, i) => i !== idx) }))} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", padding: 0, fontSize: "0.8rem", lineHeight: 1, opacity: 0.6 }}>×</button>
              </span>
            ))}
          </div>
          <input
            type="text" placeholder="Escribe y presiona Enter para agregar..." style={inputStyle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !data.tags.includes(val)) {
                  set(p => ({ ...p, tags: [...p.tags, val] }));
                }
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>

        {/* BLOQUE 4: INTRODUCCIÓN + OBJETIVOS */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}>Introducción y Objetivos</h2>
          <MarkdownInput
            value={data.introObjectives}
            onChange={(val) => set(p => ({ ...p, introObjectives: val }))}
            style={inputStyle}
            minHeight="200px"
            placeholder="Escribe la introducción y los objetivos del proyecto. Puedes usar **markdown** para formato."
          />
        </div>

        {/* BLOQUE 4: GRUPOS DE DESARROLLO */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ ...sectionHeaderStyle, borderBottom: "none", margin: 0, padding: 0 }}>
              <Code size={22} color="var(--primary)" /> Grupos de Desarrollo
            </h2>
            <button type="button" onClick={() => set(p => ({ ...p, developmentGroups: [...p.developmentGroups, { title: '', description: '', modules: [], subtotal: '', timeline: '' }] }))} className="btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.05)" }}>
              <Plus size={16} /> Añadir Grupo
            </button>
          </div>

          {data.developmentGroups.map((group, gIdx) => {
            const calcSubtotal = sumModulesUF(group.modules);
            return (
              <div key={gIdx} className="dynamic-item" style={{ borderColor: "var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>Grupo {gIdx + 1}</h3>
                  <button type="button" onClick={() => set(p => ({ ...p, developmentGroups: p.developmentGroups.filter((_, i) => i !== gIdx) }))} className="btn-icon"><Trash2 size={18} /></button>
                </div>
                <div className="bento-grid" style={{ marginBottom: "1rem" }}>
                  <div className="bento-col-8">
                    <label style={labelStyle}>Título del Grupo</label>
                    <input type="text" value={group.title} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], title: e.target.value }; return { ...p, developmentGroups: g }; })} style={inputStyle} />
                  </div>
                  <div className="bento-col-2">
                    <label style={labelStyle}>Subtotal (UF)</label>
                    <input type="text" value={calcSubtotal ? `${calcSubtotal.toFixed(1)} UF` : group.subtotal} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], subtotal: e.target.value }; return { ...p, developmentGroups: g }; })} style={{ ...inputStyle, fontWeight: "700", color: "#10b981" }} />
                  </div>
                  <div className="bento-col-2">
                    <label style={labelStyle}>Timeline</label>
                    <input type="text" value={group.timeline} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], timeline: e.target.value }; return { ...p, developmentGroups: g }; })} style={inputStyle} />
                  </div>
                  <div className="bento-col-12">
                    <label style={labelStyle}>Descripción del Grupo</label>
                    <textarea value={group.description} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], description: e.target.value }; return { ...p, developmentGroups: g }; })} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
                  </div>
                </div>

                {/* Módulos dentro del grupo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>Módulos</h4>
                  <button type="button" onClick={() => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], modules: [...g[gIdx].modules, { name: '', description: '', investment: '' }] }; return { ...p, developmentGroups: g }; })} className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir Módulo</button>
                </div>

                {group.modules.map((mod, mIdx) => (
                  <div key={mIdx} className="dynamic-item" style={{ marginLeft: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Módulo {mIdx + 1}</span>
                      <button type="button" onClick={() => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], modules: g[gIdx].modules.filter((_, i) => i !== mIdx) }; return { ...p, developmentGroups: g }; })} className="btn-icon" style={{ padding: "0.3rem" }}><Trash2 size={14} /></button>
                    </div>
                    <div className="bento-grid">
                      <div className="bento-col-5">
                        <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Nombre del Módulo</label>
                        <input type="text" value={mod.name} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], modules: g[gIdx].modules.map((m, i) => i === mIdx ? { ...m, name: e.target.value } : m) }; return { ...p, developmentGroups: g }; })} style={inputStyle} />
                      </div>
                      <div className="bento-col-4">
                        <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Descripción</label>
                        <textarea value={mod.description} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], modules: g[gIdx].modules.map((m, i) => i === mIdx ? { ...m, description: e.target.value } : m) }; return { ...p, developmentGroups: g }; })} style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
                      </div>
                      <div className="bento-col-3">
                        <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Inversión (UF)</label>
                        <input type="text" value={mod.investment} onChange={(e) => set(p => { const g = [...p.developmentGroups]; g[gIdx] = { ...g[gIdx], modules: g[gIdx].modules.map((m, i) => i === mIdx ? { ...m, investment: e.target.value } : m) }; return { ...p, developmentGroups: g }; })} style={{ ...inputStyle, fontWeight: "700", color: "#10b981" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* BLOQUE 5: ANÁLISIS COMPARATIVO */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="toggle-section" onClick={() => setShowComparative(!showComparative)}>
            <GitCompare size={18} color="var(--secondary)" />
            {showComparative ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Análisis Comparativo {showComparative ? '(visible)' : '(opcional - click para mostrar)'}
          </div>
          {showComparative && (
            <div style={{ marginTop: "1rem" }}>
              <textarea
                value={data.comparativeAnalysis}
                onChange={(e) => set(p => ({ ...p, comparativeAnalysis: e.target.value }))}
                style={{ ...inputStyle, minHeight: "150px", resize: "vertical" }}
                placeholder="Tabla comparativa Antes/Después. Ej: Área | Actual | Propuesta"
              />
            </div>
          )}
        </div>

        {/* BLOQUE 6: INTEGRACIÓN */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="toggle-section" onClick={() => setShowIntegration(!showIntegration)}>
            <Puzzle size={18} color="var(--primary)" />
            {showIntegration ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Análisis de Integración {showIntegration ? '(visible)' : '(opcional - click para mostrar)'}
          </div>
          {showIntegration && (
            <div style={{ marginTop: "1rem" }}>
              <textarea
                value={data.integration}
                onChange={(e) => set(p => ({ ...p, integration: e.target.value }))}
                style={{ ...inputStyle, minHeight: "150px", resize: "vertical" }}
                placeholder="Describe cómo se integran los sistemas y las conexiones con APIs de terceros."
              />
            </div>
          )}
        </div>

        {/* BLOQUE 7: DIFERENCIADORES */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="toggle-section" onClick={() => setShowDifferentiators(!showDifferentiators)}>
            <Sparkles size={18} color="#f59e0b" />
            {showDifferentiators ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Valor Agregado / Diferenciadores {showDifferentiators ? '(visible)' : '(opcional - click para mostrar)'}
          </div>
          {showDifferentiators && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-muted)" }}>Items diferenciadores (A, B, C...)</span>
                <button type="button" onClick={() => set(p => ({ ...p, differentiators: [...p.differentiators, { label: autoLabel(p.differentiators.length), title: '', description: '' }] }))} className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir</button>
              </div>
              {data.differentiators.map((diff, idx) => (
                <div key={idx} className="dynamic-item" style={{ borderLeft: "4px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "900", fontSize: "1.2rem", color: "#f59e0b" }}>{diff.label}</span>
                    <button type="button" onClick={() => set(p => ({ ...p, differentiators: p.differentiators.filter((_, i) => i !== idx) }))} className="btn-icon" style={{ padding: "0.3rem" }}><Trash2 size={14} /></button>
                  </div>
                  <div className="bento-grid">
                    <div className="bento-col-6">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Título</label>
                      <input type="text" value={diff.title} onChange={(e) => set(p => { const d = [...p.differentiators]; d[idx] = { ...d[idx], title: e.target.value }; return { ...p, differentiators: d }; })} style={inputStyle} />
                    </div>
                    <div className="bento-col-12">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Descripción</label>
                      <textarea value={diff.description} onChange={(e) => set(p => { const d = [...p.differentiators]; d[idx] = { ...d[idx], description: e.target.value }; return { ...p, differentiators: d }; })} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BLOQUE 8: MARKETING */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="toggle-section" onClick={() => setShowMarketing(!showMarketing)}>
            <BarChart3 size={18} color="#3b82f6" />
            {showMarketing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Estrategia de Marketing {showMarketing ? '(visible)' : '(opcional - click para mostrar)'}
          </div>
          {showMarketing && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-muted)" }}>Planes mensuales</span>
                <button type="button" onClick={() => set(p => ({ ...p, marketing: [...p.marketing, { name: '', description: '', investment: '' }] }))} className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir Plan</button>
              </div>
              {data.marketing.map((mkt, idx) => (
                <div key={idx} className="dynamic-item" style={{ borderLeft: "4px solid #3b82f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Plan {idx + 1}</span>
                    <button type="button" onClick={() => set(p => ({ ...p, marketing: p.marketing.filter((_, i) => i !== idx) }))} className="btn-icon" style={{ padding: "0.3rem" }}><Trash2 size={14} /></button>
                  </div>
                  <div className="bento-grid">
                    <div className="bento-col-4">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Nombre del Plan</label>
                      <input type="text" value={mkt.name} onChange={(e) => set(p => { const m = [...p.marketing]; m[idx] = { ...m[idx], name: e.target.value }; return { ...p, marketing: m }; })} style={inputStyle} />
                    </div>
                    <div className="bento-col-5">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Descripción</label>
                      <textarea value={mkt.description} onChange={(e) => set(p => { const m = [...p.marketing]; m[idx] = { ...m[idx], description: e.target.value }; return { ...p, marketing: m }; })} style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
                    </div>
                    <div className="bento-col-3">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Inversión Mensual</label>
                      <input type="text" value={mkt.investment} onChange={(e) => set(p => { const m = [...p.marketing]; m[idx] = { ...m[idx], investment: e.target.value }; return { ...p, marketing: m }; })} style={{ ...inputStyle, fontWeight: "700", color: "#10b981" }} placeholder="ej: 1 UF/mes" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BLOQUE 9: MOCKUPS */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="toggle-section" onClick={() => setShowMockups(!showMockups)}>
            <Image size={18} color="#8b5cf6" />
            {showMockups ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Mockups / Imágenes de Referencia {showMockups ? '(visible)' : '(opcional - click para mostrar)'}
          </div>
          {showMockups && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-muted)" }}>Imágenes</span>
                <button type="button" onClick={() => set(p => ({ ...p, mockups: [...p.mockups, { url: '', caption: '' }] }))} className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir Imagen</button>
              </div>
              {data.mockups.map((mock, idx) => (
                <div key={idx} className="dynamic-item" style={{ borderLeft: "4px solid #8b5cf6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Imagen {idx + 1}</span>
                    <button type="button" onClick={() => set(p => ({ ...p, mockups: p.mockups.filter((_, i) => i !== idx) }))} className="btn-icon" style={{ padding: "0.3rem" }}><Trash2 size={14} /></button>
                  </div>
                  <div className="bento-grid">
                    <div className="bento-col-8">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>URL de la Imagen</label>
                      <input type="text" value={mock.url} onChange={(e) => set(p => { const m = [...p.mockups]; m[idx] = { ...m[idx], url: e.target.value }; return { ...p, mockups: m }; })} style={inputStyle} placeholder="https://..." />
                    </div>
                    <div className="bento-col-4">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Pie de Foto</label>
                      <input type="text" value={mock.caption} onChange={(e) => set(p => { const m = [...p.mockups]; m[idx] = { ...m[idx], caption: e.target.value }; return { ...p, mockups: m }; })} style={inputStyle} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BLOQUE 10: COMERCIAL */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><DollarSign size={22} color="#10b981" /> Condiciones Comerciales</h2>
          <div className="bento-grid">
            <div className="bento-col-4">
              <label style={labelStyle}>Inversión Total</label>
              <input type="text" value={data.commercial.total} onChange={(e) => set(p => ({ ...p, commercial: { ...p.commercial, total: e.target.value } }))} style={{ ...inputStyle, color: "#10b981", fontWeight: "900", fontSize: "1.2rem" }} required />
            </div>
            <div className="bento-col-4">
              <label style={labelStyle}>Plazo de Ejecución</label>
              <input type="text" value={data.commercial.timeline} onChange={(e) => set(p => ({ ...p, commercial: { ...p.commercial, timeline: e.target.value } }))} style={inputStyle} required />
            </div>
            <div className="bento-col-4">
              <label style={labelStyle}>Total Pagos</label>
              <input type="text" value={sumPayments(data.commercial.payment) || '—'} readOnly style={{ ...inputStyle, fontWeight: "700", color: "var(--text-muted)" }} />
            </div>

            <div className="bento-col-12" style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <label style={{ ...labelStyle, margin: 0 }}>Esquema de Pago</label>
                <button type="button" onClick={() => set(p => ({ ...p, commercial: { ...p.commercial, payment: [...p.commercial.payment, { percentage: '', description: '', amount: '' }] } }))} className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir Pago</button>
              </div>
              {data.commercial.payment.map((pay, idx) => (
                <div key={idx} className="dynamic-item" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Pago {idx + 1}</span>
                    <button type="button" onClick={() => set(p => ({ ...p, commercial: { ...p.commercial, payment: p.commercial.payment.filter((_, i) => i !== idx) } }))} className="btn-icon" style={{ padding: "0.3rem" }}><Trash2 size={14} /></button>
                  </div>
                  <div className="bento-grid">
                    <div className="bento-col-2">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>%</label>
                      <input type="text" value={pay.percentage} onChange={(e) => set(p => { const pm = [...p.commercial.payment]; pm[idx] = { ...pm[idx], percentage: e.target.value }; return { ...p, commercial: { ...p.commercial, payment: pm } }; })} style={inputStyle} placeholder="50%" />
                    </div>
                    <div className="bento-col-7">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Descripción</label>
                      <input type="text" value={pay.description} onChange={(e) => set(p => { const pm = [...p.commercial.payment]; pm[idx] = { ...pm[idx], description: e.target.value }; return { ...p, commercial: { ...p.commercial, payment: pm } }; })} style={inputStyle} />
                    </div>
                    <div className="bento-col-3">
                      <label style={{ ...labelStyle, fontSize: "0.8rem" }}>Monto</label>
                      <input type="text" value={pay.amount} onChange={(e) => set(p => { const pm = [...p.commercial.payment]; pm[idx] = { ...pm[idx], amount: e.target.value }; return { ...p, commercial: { ...p.commercial, payment: pm } }; })} style={{ ...inputStyle, fontWeight: "700" }} placeholder="6.5 UF" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bento-col-12" style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Propiedad Intelectual</label>
              <textarea value={data.commercial.intellectualProperty} onChange={(e) => set(p => ({ ...p, commercial: { ...p.commercial, intellectualProperty: e.target.value } }))} style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
            </div>

            <div className="bento-col-12">
              <label style={labelStyle}>Facilidades y Garantía</label>
              <textarea value={data.commercial.warranty} onChange={(e) => set(p => ({ ...p, commercial: { ...p.commercial, warranty: e.target.value } }))} style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: "1.5rem", border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}>
            <p style={{ color: "#ef4444", fontSize: "1rem", fontWeight: "600", margin: 0, textAlign: "center" }}>{error}</p>
          </div>
        )}

        <div className="action-btns" style={{ marginTop: "1rem" }}>
          <button type="button" onClick={() => router.push('/dashboard')} className="btn btn-outline" style={{ padding: "1rem 2rem" }}>Cancelar</button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "1rem 2rem", border: "none" }}>
            {loading ? 'Generando Propuesta...' : 'Crear Propuesta Segura'}
          </button>
        </div>
      </form>
    </div>
  );
}
