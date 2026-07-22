'use client';

import { useState, useEffect } from 'react';
import { loginAdmin } from '@/app/actions/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, FileCode, Wrench, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';

function LoginForm() {
  const [selected, setSelected] = useState<'flow' | 'nexus' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const to = searchParams.get('to');
    if (to === 'nexus' || to === 'flow') setSelected(to);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    setLoading(true);
    const result = await loginAdmin(password);
    if (result.success) {
      router.push(selected === 'flow' ? '/dashboard' : '/nexus');
      router.refresh();
    } else {
      setError(result.error || 'Error desconocido');
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`@media (max-width: 480px) { .login-card { padding: 1.25rem !important; border-radius: 16px !important; } .login-sel { padding: 0.75rem 0.4rem !important; } .login-sel-icon { width: 32px !important; height: 32px !important; } .login-sel-icon svg { width: 16px !important; height: 16px !important; } .login-sel-label { font-size: 0.82rem !important; } .login-sel-desc { font-size: 0.58rem !important; } .login-input-icon { display: none !important; } .login-input { padding-left: 1rem !important; } }
        .login-mesh { background-image: radial-gradient(at 15% 20%, rgba(124,58,237,0.28) 0px, transparent 50%), radial-gradient(at 85% 80%, rgba(8,145,178,0.22) 0px, transparent 50%) !important; animation-duration: 18s !important; }
        .login-mesh-2 { background-image: radial-gradient(at 80% 15%, rgba(124,58,237,0.08) 0px, transparent 40%), radial-gradient(at 20% 85%, rgba(8,145,178,0.06) 0px, transparent 40%) !important; animation: mesh-move 22s infinite alternate-reverse ease-in-out !important; }
      `}</style>

      {/* Mesh backgrounds */}
      <div className="mesh-bg login-mesh"></div>
      <div className="mesh-bg login-mesh-2"></div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px", margin: "0 1rem" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem", animation: "fade-up 0.6s ease" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.8rem" }}>
            <Image src="/logo_white.png" alt="Orion Technology" width={100} height={33} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} priority />
          </div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em", margin: 0, color: "var(--text)" }}>Panel de Administración</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem", fontWeight: 500 }}>Selecciona un sistema para continuar</p>
        </div>

        {/* Card */}
        <div className="login-card" style={{ background: "#fff", borderRadius: "20px", border: "1px solid var(--border)", padding: "1.75rem", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* System selection */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button type="button" onClick={() => setSelected('flow')} className="login-sel"
                style={{ padding: "1rem 0.6rem", borderRadius: "14px", border: selected === 'flow' ? "1.5px solid var(--primary)" : "1px solid var(--border)", background: selected === 'flow' ? "var(--primary-soft)" : "var(--bg)", cursor: "pointer", transition: "all 0.25s", textAlign: "center", fontFamily: "inherit", position: "relative", transform: selected === 'flow' ? "scale(1.02)" : "scale(1)" }}>
                <div className="login-sel-icon" style={{ width: "40px", height: "40px", borderRadius: "12px", background: selected === 'flow' ? "var(--primary-glow)" : "var(--bg-accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.4rem", transition: "all 0.25s" }}>
                  <FileCode size={20} style={{ color: selected === 'flow' ? "var(--primary)" : "var(--text-muted)", transition: "color 0.25s" }} />
                </div>
                <div className="login-sel-label" style={{ fontWeight: 700, fontSize: "0.9rem", color: selected === 'flow' ? "var(--text)" : "var(--text-muted)", marginBottom: "0.1rem", transition: "color 0.25s" }}>Flow</div>
                <div className="login-sel-desc" style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 500, lineHeight: "1.3", opacity: selected === 'flow' ? 1 : 0.6 }}>Propuestas<br/>software & web</div>
                {selected === 'flow' && (
                  <div style={{ position: "absolute", top: "6px", right: "6px", width: "16px", height: "16px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                    <Sparkles size={9} color="#fff" />
                  </div>
                )}
              </button>

              <button type="button" onClick={() => setSelected('nexus')} className="login-sel"
                style={{ padding: "1rem 0.6rem", borderRadius: "14px", border: selected === 'nexus' ? "1.5px solid var(--secondary)" : "1px solid var(--border)", background: selected === 'nexus' ? "var(--secondary-soft)" : "var(--bg)", cursor: "pointer", transition: "all 0.25s", textAlign: "center", fontFamily: "inherit", position: "relative", transform: selected === 'nexus' ? "scale(1.02)" : "scale(1)" }}>
                <div className="login-sel-icon" style={{ width: "40px", height: "40px", borderRadius: "12px", background: selected === 'nexus' ? "var(--secondary-glow)" : "var(--bg-accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.4rem", transition: "all 0.25s" }}>
                  <Wrench size={20} style={{ color: selected === 'nexus' ? "var(--secondary)" : "var(--text-muted)", transition: "color 0.25s" }} />
                </div>
                <div className="login-sel-label" style={{ fontWeight: 700, fontSize: "0.9rem", color: selected === 'nexus' ? "var(--text)" : "var(--text-muted)", marginBottom: "0.1rem", transition: "color 0.25s" }}>Nexus</div>
                <div className="login-sel-desc" style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 500, lineHeight: "1.3", opacity: selected === 'nexus' ? 1 : 0.6 }}>Servicio técnico<br/>reparaciones</div>
                {selected === 'nexus' && (
                  <div style={{ position: "absolute", top: "6px", right: "6px", width: "16px", height: "16px", borderRadius: "50%", background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(8,145,178,0.3)" }}>
                    <Sparkles size={9} color="#fff" />
                  </div>
                )}
              </button>
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <Lock size={16} className="login-input-icon" style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: focused ? "var(--primary)" : "var(--text-muted)", pointerEvents: "none", transition: "color 0.25s", zIndex: 1 }} />
              <input type={showPassword ? "text" : "password"} placeholder="Contraseña de acceso" value={password}
                onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                className="login-input"
                style={{ width: "100%", padding: "0.7rem 2.5rem 0.7rem 2.8rem", background: "var(--bg)", border: focused ? "1.5px solid var(--primary)" : "1px solid var(--border)", borderRadius: "12px", color: "var(--text)", fontSize: "0.85rem", fontFamily: "inherit", letterSpacing: "0.02em", outline: "none", transition: "all 0.25s", boxShadow: focused ? "0 0 0 3px var(--primary-glow)" : "none" }}
                required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.3rem", transition: "color 0.25s", zIndex: 1 }}
                tabIndex={-1}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "var(--danger-soft)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "0.5rem 0.8rem" }}>
                <p style={{ color: "var(--danger)", fontSize: "0.78rem", fontWeight: "600", margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !selected}
              style={{ width: "100%", padding: "0.65rem", fontSize: "0.88rem", fontWeight: 650, fontFamily: "inherit", border: "none", borderRadius: "12px", cursor: loading || !selected ? "not-allowed" : "pointer", background: selected ? (selected === 'nexus' ? "var(--secondary)" : "var(--primary)") : "var(--bg-accent)", color: "#fff", transition: "all 0.25s", opacity: loading || !selected ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
              onMouseEnter={e => { if (!loading && selected) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = selected === 'nexus' ? '0 4px 16px rgba(8,145,178,0.25)' : '0 4px 16px rgba(124,58,237,0.25)'; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}>
              {loading ? <><div className="spinner" /> Ingresando...</> : <><span>Iniciar sesión</span> <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.65rem", color: "var(--text-muted)", opacity: 0.5, fontWeight: 600 }}>
          Orion Technology &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
