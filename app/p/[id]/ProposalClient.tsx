'use client';

import { useState } from 'react';
import { unlockProposal } from '@/app/actions/proposals';
import { Lock, ShieldCheck, ChevronRight, CheckCircle2, MonitorSmartphone, Code, HeartPulse, Zap, Layers, Frame } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';

export default function ProposalClient({ proposalInfo }: { proposalInfo: any }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await unlockProposal(proposalInfo.id, password);
    
    if (result.success && result.content) {
      try {
        setProposalData(JSON.parse(result.content));
      } catch (err) {
        setProposalData({ _raw: result.content });
      }
    } else {
      setError(result.error || 'Acceso denegado');
    }
    setLoading(false);
  };

  if (!proposalData) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div className="mesh-bg"></div>
        <div className="container" style={{ display: "flex", justifyContent: "center", zIndex: 10 }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "3rem", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <div style={{ width: "60px", height: "60px", background: "var(--bg)", border: "1px solid var(--glass-border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--primary-glow)" }}>
                <Lock size={30} color="var(--primary)" />
              </div>
            </div>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Acceso Seguro</h1>
            <p className="text-muted" style={{ marginBottom: "2rem", fontSize: "0.95rem" }}>
              Esta propuesta tecnológica es confidencial y ha sido preparada exclusivamente para <strong>{proposalInfo.clientName}</strong>.
            </p>
            
            <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1rem 1.2rem",
                  background: "var(--bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "10px",
                  color: "var(--text)",
                  fontSize: "1.1rem",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  textAlign: "center",
                  letterSpacing: "0.2em"
                }}
                required
              />
              {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "600", margin: 0 }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-center"
                style={{ width: "100%", border: "none", gap: "0.5rem" }}
              >
                {loading ? 'Verificando...' : 'Desbloquear Propuesta'}
                {!loading && <ChevronRight size={20} />}
              </button>
            </form>
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
              <ShieldCheck size={16} color="#10b981" /> Encriptación de Grado Militar - Orion Tech
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Vista de Propuesta Desbloqueada
  return (
    <main>
      <div className="mesh-bg"></div>
      
      {/* Header (Mismo que Navbar para consistencia) */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", padding: "1.5rem 0", background: "var(--bg)", borderBottom: "1px solid var(--glass-border)", zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/logo_white.png"
              alt="Orion Logo"
              width={120}
              height={40}
              style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }}
              priority
            />
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)" }}>Propuesta Confidencial</div>
        </div>
      </div>

      <div style={{ paddingTop: "8rem" }}>
        {/* Título Principal */}
        <section className="section container" style={{ paddingTop: "2rem", paddingBottom: "2rem", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <span className="section-tag" style={{ color: "var(--primary)", borderColor: "var(--primary-glow)", background: "rgba(124, 58, 237, 0.05)" }}>
              SISTEMA DE GESTIÓN CLÍNICA
            </span>
            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "-0.05em", lineHeight: "1", margin: "1rem 0 2rem" }}>
              Transformación Digital para <br />
              <span className="text-gradient">{proposalInfo.clientName}</span>
            </h1>
            <p className="subtitle" style={{ margin: "0 auto", fontSize: "1.15rem", lineHeight: "1.8" }}>
              {proposalData.intro}
            </p>
          </div>
        </section>

        {/* Objetivos */}
        <section className="section container" style={{ paddingTop: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: "3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Zap size={32} color="var(--secondary)" /> Objetivos del Proyecto
          </h2>
          <div className="bento-grid">
            {proposalData.objectives.map((obj: any, idx: number) => {
              const icons = [MonitorSmartphone, HeartPulse, Code];
              const Icon = icons[idx % icons.length];
              return (
                <div key={idx} className="bento-col-4 glass-panel hover-scale" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ background: "var(--bg)", width: "50px", height: "50px", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={24} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "800", lineHeight: "1.2", margin: 0 }}>{obj.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.7", margin: 0 }}>{obj.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Desarrollo */}
        <section className="section container" style={{ paddingTop: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: "3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Code size={32} color="var(--primary)" /> Desarrollo del Ecosistema
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {/* WEB */}
            <div className="glass-panel" style={{ padding: "3rem", borderLeft: "4px solid var(--secondary)" }}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--secondary)", marginBottom: "1rem" }}>
                {proposalData.development.web.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: "1.7" }}>
                {proposalData.development.web.desc}
              </p>
              
              <div className="bento-grid">
                {proposalData.development.web.items.map((item: any, idx: number) => (
                  <div key={idx} className="bento-col-6" style={{ background: "var(--bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
                      <CheckCircle2 size={20} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
                      {item.title}
                    </h4>
                    <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: "1.6", fontSize: "0.95rem" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SISTEMA */}
            <div className="glass-panel" style={{ padding: "3rem", borderLeft: "4px solid var(--primary)" }}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--primary)", marginBottom: "1rem" }}>
                {proposalData.development.system.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "3rem", lineHeight: "1.7" }}>
                {proposalData.development.system.desc}
              </p>
              
              <div className="timeline" style={{ paddingLeft: "10px" }}>
                {proposalData.development.system.items.map((item: any, idx: number) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-num">{idx + 1}</div>
                    <div style={{ background: "var(--bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--glass-border)", flex: 1 }}>
                      <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem" }}>{item.title}</h4>
                      <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: "1.6", fontSize: "0.95rem" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Integración */}
        <section className="section container" style={{ paddingTop: "3rem" }}>
          <div className="glass-panel" style={{ padding: "3rem", background: "linear-gradient(135deg, var(--glass) 0%, rgba(124, 58, 237, 0.05) 100%)", textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Análisis de la Integración</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.15rem", lineHeight: "1.8", margin: "0 auto", maxWidth: "900px" }}>
              {proposalData.integration}
            </p>
          </div>
        </section>

        {/* Condiciones */}
        <section className="section container" style={{ paddingTop: "3rem", paddingBottom: "6rem" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: "3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <ShieldCheck size={32} color="#10b981" /> Condiciones Comerciales
          </h2>
          
          <div className="bento-grid">
            <div className="bento-col-4 glass-panel" style={{ padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
              <span className="section-tag" style={{ margin: "0 auto 1.5rem" }}>Inversión Total</span>
              <p style={{ fontSize: "3rem", fontWeight: "900", color: "#10b981", margin: 0, lineHeight: "1" }}>
                {proposalData.commercial.total}
              </p>
            </div>
            
            <div className="bento-col-8 glass-panel" style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Plazo de Ejecución</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", margin: 0 }}>{proposalData.commercial.time}</p>
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "1rem" }}>Esquema de Pago</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {proposalData.commercial.payment.map((pay: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "var(--bg)", padding: "1.5rem", borderRadius: "10px", border: "1px solid var(--glass-border)" }}>
                      <CheckCircle2 size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1rem", lineHeight: "1.5" }}>{pay}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--glass-border)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Facilidades y Garantía</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem", margin: 0, lineHeight: "1.6" }}>{proposalData.commercial.warranty}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ padding: "4rem 0", textAlign: "center", borderTop: "1px solid var(--glass-border)", background: "var(--bg)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <Image
            src="/logo_white.png"
            alt="Orion Logo"
            width={140}
            height={46}
            style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }}
          />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Sistemas de Inteligencia y Eficiencia Operativa de Precisión</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "2rem", opacity: 0.5 }}>© 2026. Todos los derechos reservados.</p>
      </footer>
      <BackToTop />
    </main>
  );
}
