'use client';

import { useState } from 'react';
import { createProposal } from '@/app/actions/proposals';
import { useRouter } from 'next/navigation';
import { saraProposalTemplate } from '@/lib/proposal-template';
import { Sparkles, KeyRound, User, FileText, Code2 } from 'lucide-react';

export default function NewProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: 'Transformación Digital: Sistema de Gestión Clínica',
    clientName: 'Sara Largacha Vivas',
    password: '',
    content: JSON.stringify(saraProposalTemplate, null, 2),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.password) {
      setError('Debes ingresar una contraseña para la propuesta');
      setLoading(false);
      return;
    }

    try {
      JSON.parse(formData.content);
      
      const result = await createProposal(
        {
          title: formData.title,
          clientName: formData.clientName,
          content: formData.content,
        },
        formData.password
      );

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Error al crear la propuesta');
      }
    } catch (e) {
      setError('El formato del contenido JSON es inválido.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "1rem 1.2rem",
    background: "var(--bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "10px",
    color: "var(--text)",
    fontSize: "1rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.3s ease",
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--text-muted)",
    marginBottom: "0.5rem"
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .action-btns { display: flex; justify-content: flex-end; gap: 1rem; }
        @media (max-width: 768px) {
          .action-btns { flex-direction: column; width: 100%; }
          .action-btns .btn { width: 100%; justify-content: center; }
        }
      `}} />
      <div style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          Nueva Propuesta <Sparkles color="var(--primary)" />
        </h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>Configura los datos del cliente y genera el link seguro estructurado.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bento-grid" style={{ marginBottom: "2rem" }}>
          
          <div className="bento-col-6 glass-panel" style={{ padding: "2rem" }}>
            <label style={labelStyle}><User size={18} color="var(--primary)" /> Nombre del Cliente</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              style={inputStyle}
              placeholder="Ej: Sara Largacha Vivas"
              required
            />
          </div>
          
          <div className="bento-col-6 glass-panel" style={{ padding: "2rem" }}>
            <label style={labelStyle}><KeyRound size={18} color="var(--secondary)" /> Contraseña de Acceso</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={inputStyle}
              placeholder="La contraseña que le darás al cliente"
              required
            />
          </div>

          <div className="bento-col-12 glass-panel" style={{ padding: "2rem" }}>
            <label style={labelStyle}><FileText size={18} color="#10b981" /> Título de la Propuesta</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={inputStyle}
              required
            />
          </div>

          <div className="bento-col-12 glass-panel" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}><Code2 size={18} color="var(--primary)" /> Contenido JSON de la Propuesta</label>
              <span className="badge" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>Modo Avanzado</span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={20}
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.85rem", lineHeight: "1.5", resize: "vertical" }}
              required
            />
          </div>

        </div>

        {error && (
          <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}>
            <p style={{ color: "#ef4444", fontSize: "1rem", fontWeight: "600", margin: 0, textAlign: "center" }}>{error}</p>
          </div>
        )}

        <div className="action-btns">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="btn btn-outline"
            style={{ padding: "1rem 2rem" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "1rem 2rem", border: "none" }}
          >
            {loading ? 'Generando Enlace...' : 'Crear Propuesta Segura'}
          </button>
        </div>
      </form>
    </div>
  );
}
