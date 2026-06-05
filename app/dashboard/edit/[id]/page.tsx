'use client';

import { useState, useEffect, use } from 'react';
import { updateProposal, getProposalAdminInfo } from '@/app/actions/proposals';
import { useRouter } from 'next/navigation';
import { Sparkles, KeyRound, User, FileText, Plus, Trash2, Settings, MonitorSmartphone, Code, DollarSign } from 'lucide-react';

export default function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Datos Generales
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [password, setPassword] = useState(''); // Opcional en edición

  // Estructura de la Propuesta
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      const res = await getProposalAdminInfo(id);
      if (res.success && res.proposal) {
        setTitle(res.proposal.title);
        setClientName(res.proposal.clientName);
        try {
          setData(JSON.parse(res.proposal.content));
        } catch(e) {
          setError('El contenido de la propuesta está corrupto.');
        }
      } else {
        setError('No se pudo cargar la propuesta.');
      }
      setInitialLoad(false);
    };
    fetchProposal();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await updateProposal(
        id,
        {
          title,
          clientName,
          content: JSON.stringify(data),
        },
        password // Si está vacío, updateProposal lo ignora y mantiene el antiguo
      );

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Error al actualizar la propuesta');
      }
    } catch (e) {
      setError('Error interno al compilar la propuesta.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <div style={{ padding: "3rem", textAlign: "center" }}>Cargando propuesta...</div>;
  if (!data) return <div style={{ padding: "3rem", textAlign: "center", color: "red" }}>{error}</div>;

  const inputStyle = {
    width: "100%",
    padding: "0.6rem 0.8rem",
    background: "#ffffff",
    border: "1px solid var(--glass-border)",
    borderRadius: "6px",
    color: "#0f172a",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.3s ease",
  };

  const labelStyle = {
    display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.3rem"
  };

  const sectionHeaderStyle = {
    fontSize: "1.2rem", fontWeight: "800", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.8rem"
  };

  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .action-btns { display: flex; justify-content: flex-end; gap: 1rem; }
        .dynamic-item { background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px; border: 1px dashed var(--glass-border); margin-bottom: 1rem; position: relative; }
        .btn-icon { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 6px; padding: 0.4rem; cursor: pointer; transition: 0.2s; }
        .btn-icon:hover { background: #ef4444; color: white; }
        @media (max-width: 768px) {
          .action-btns { flex-direction: column; width: 100%; }
          .action-btns .btn { width: 100%; justify-content: center; }
        }
      `}} />
      <div style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          Editar Propuesta <Sparkles color="var(--primary)" />
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>Modifica los datos y presiona actualizar.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* BLOQUE 1 */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><Settings size={22} color="var(--primary)" /> Configuración Básica</h2>
          <div className="bento-grid">
            <div className="bento-col-6">
              <label style={labelStyle}><User size={16} /> Nombre del Cliente</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} style={inputStyle} required />
            </div>
            <div className="bento-col-6">
              <label style={labelStyle}><KeyRound size={16} /> Contraseña de Acceso</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="(Dejar en blanco para no cambiar)" />
            </div>
            <div className="bento-col-12">
              <label style={labelStyle}><FileText size={16} /> Título de la Propuesta</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: INTRO */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}>Reseña e Introducción</h2>
          <textarea value={data.intro} onChange={(e) => setData({...data, intro: e.target.value})} style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} required />
        </div>

        {/* BLOQUE 3: OBJETIVOS */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ ...sectionHeaderStyle, borderBottom: "none", margin: 0, padding: 0 }}>Objetivos Estratégicos</h2>
            <button type="button" onClick={() => setData({...data, objectives: [...data.objectives, {title: '', desc: ''}]})} className="btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.05)" }}>
              <Plus size={16} /> Añadir
            </button>
          </div>
          {data.objectives.map((obj: any, idx: number) => (
            <div key={idx} className="dynamic-item bento-grid">
              <div className="bento-col-12" style={{ display: "flex", justifyContent: "space-between" }}>
                <input type="text" value={obj.title} placeholder="Título del objetivo" style={{ ...inputStyle, fontWeight: "bold" }} required onChange={(e) => { const newObj = [...data.objectives]; newObj[idx].title = e.target.value; setData({...data, objectives: newObj}); }} />
                <button type="button" onClick={() => { setData({...data, objectives: data.objectives.filter((_:any, i:number) => i !== idx)}); }} className="btn-icon" style={{ marginLeft: "1rem" }}><Trash2 size={18} /></button>
              </div>
              <div className="bento-col-12">
                <textarea value={obj.desc} placeholder="Descripción" style={{ ...inputStyle, minHeight: "80px" }} required onChange={(e) => { const newObj = [...data.objectives]; newObj[idx].desc = e.target.value; setData({...data, objectives: newObj}); }} />
              </div>
            </div>
          ))}
        </div>

        {/* BLOQUE 4: DESARROLLO (WEB) */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><MonitorSmartphone size={22} color="var(--secondary)" /> Fase 1: Desarrollo Web</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            <input type="text" value={data.development?.web?.title || ''} onChange={(e) => setData({...data, development: {...data.development, web: {...data.development.web, title: e.target.value}}})} style={{ ...inputStyle, fontWeight: "bold" }} required />
            <textarea value={data.development?.web?.desc || ''} onChange={(e) => setData({...data, development: {...data.development, web: {...data.development.web, desc: e.target.value}}})} style={{ ...inputStyle, minHeight: "80px" }} required />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Características de la Web</h3>
            <button type="button" onClick={() => setData({...data, development: {...data.development, web: {...data.development.web, items: [...(data.development?.web?.items || []), {title: '', desc: ''}]}}})} className="btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir Item</button>
          </div>
          
          {(data.development?.web?.items || []).map((item: any, idx: number) => (
            <div key={idx} className="dynamic-item" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input type="text" value={item.title} placeholder="Característica" style={{ ...inputStyle, fontWeight: "bold" }} required onChange={(e) => {
                  const newItems = [...data.development.web.items]; newItems[idx].title = e.target.value; setData({...data, development: {...data.development, web: {...data.development.web, items: newItems}}});
                }} />
                <button type="button" onClick={() => {
                  const newItems = data.development.web.items.filter((_:any, i:number) => i !== idx); setData({...data, development: {...data.development, web: {...data.development.web, items: newItems}}});
                }} className="btn-icon"><Trash2 size={16} /></button>
              </div>
              <textarea value={item.desc} placeholder="Descripción" style={{ ...inputStyle, minHeight: "60px" }} required onChange={(e) => {
                const newItems = [...data.development.web.items]; newItems[idx].desc = e.target.value; setData({...data, development: {...data.development, web: {...data.development.web, items: newItems}}});
              }} />
            </div>
          ))}
        </div>

        {/* BLOQUE 5: DESARROLLO (SISTEMA) */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><Code size={22} color="var(--primary)" /> Fase 2: Desarrollo del Sistema</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            <input type="text" value={data.development?.system?.title || ''} onChange={(e) => setData({...data, development: {...data.development, system: {...data.development.system, title: e.target.value}}})} style={{ ...inputStyle, fontWeight: "bold" }} required />
            <textarea value={data.development?.system?.desc || ''} onChange={(e) => setData({...data, development: {...data.development, system: {...data.development.system, desc: e.target.value}}})} style={{ ...inputStyle, minHeight: "80px" }} required />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Módulos del Sistema</h3>
            <button type="button" onClick={() => setData({...data, development: {...data.development, system: {...data.development.system, items: [...(data.development?.system?.items || []), {title: '', desc: ''}]}}})} className="btn" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /> Añadir Módulo</button>
          </div>
          
          {(data.development?.system?.items || []).map((item: any, idx: number) => (
            <div key={idx} className="dynamic-item" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input type="text" value={item.title} placeholder="Nombre del módulo" style={{ ...inputStyle, fontWeight: "bold" }} required onChange={(e) => {
                  const newItems = [...data.development.system.items]; newItems[idx].title = e.target.value; setData({...data, development: {...data.development, system: {...data.development.system, items: newItems}}});
                }} />
                <button type="button" onClick={() => {
                  const newItems = data.development.system.items.filter((_:any, i:number) => i !== idx); setData({...data, development: {...data.development, system: {...data.development.system, items: newItems}}});
                }} className="btn-icon"><Trash2 size={16} /></button>
              </div>
              <textarea value={item.desc} placeholder="Descripción" style={{ ...inputStyle, minHeight: "60px" }} required onChange={(e) => {
                const newItems = [...data.development.system.items]; newItems[idx].desc = e.target.value; setData({...data, development: {...data.development, system: {...data.development.system, items: newItems}}});
              }} />
            </div>
          ))}
        </div>

        {/* BLOQUE 6: INTEGRACIÓN */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}>Análisis de la Integración</h2>
          <textarea value={data.integration} onChange={(e) => setData({...data, integration: e.target.value})} style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} required />
        </div>

        {/* BLOQUE 7: COMERCIAL */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h2 style={sectionHeaderStyle}><DollarSign size={22} color="#10b981" /> Condiciones Comerciales</h2>
          <div className="bento-grid">
            <div className="bento-col-6">
              <label style={labelStyle}>Inversión Total</label>
              <input type="text" value={data.commercial?.total || ''} onChange={(e) => setData({...data, commercial: {...data.commercial, total: e.target.value}})} style={{ ...inputStyle, color: "#10b981", fontWeight: "900", fontSize: "1.2rem" }} required />
            </div>
            <div className="bento-col-6">
              <label style={labelStyle}>Plazo de Ejecución</label>
              <input type="text" value={data.commercial?.time || ''} onChange={(e) => setData({...data, commercial: {...data.commercial, time: e.target.value}})} style={inputStyle} required />
            </div>
            <div className="bento-col-12" style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <label style={{ ...labelStyle, margin: 0 }}>Esquema de Pago</label>
                <button type="button" onClick={() => setData({...data, commercial: {...data.commercial, payment: [...(data.commercial?.payment || []), '']}})} className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.05)" }}><Plus size={14} /></button>
              </div>
              {(data.commercial?.payment || []).map((pay: string, idx: number) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input type="text" value={pay} onChange={(e) => {
                    const newPays = [...data.commercial.payment]; newPays[idx] = e.target.value; setData({...data, commercial: {...data.commercial, payment: newPays}});
                  }} style={inputStyle} required />
                  <button type="button" onClick={() => {
                    const newPays = data.commercial.payment.filter((_:any, i:number) => i !== idx); setData({...data, commercial: {...data.commercial, payment: newPays}});
                  }} className="btn-icon" style={{ padding: "0.8rem" }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="bento-col-12" style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Facilidades y Garantía</label>
              <textarea value={data.commercial?.warranty || ''} onChange={(e) => setData({...data, commercial: {...data.commercial, warranty: e.target.value}})} style={{ ...inputStyle, minHeight: "80px" }} required />
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
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "1rem 2rem", border: "none" }}>{loading ? 'Actualizando...' : 'Actualizar Propuesta'}</button>
        </div>
      </form>
    </div>
  );
}
