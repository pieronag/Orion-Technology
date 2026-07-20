'use client';

import { useState } from 'react';
import { loginAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginAdmin(password);
    if (result.success) { router.push('/dashboard'); router.refresh(); }
    else { setError(result.error || 'Error desconocido'); setLoading(false); }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div className="mesh-bg"></div>

      <div className="container" style={{ display: "flex", justifyContent: "center", zIndex: 10 }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "380px", textAlign: "center", padding: "2.5rem", animation: "fade-up 0.4s ease forwards" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <Image src="/logo_white.png" alt="Orion Logo" width={110} height={37} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} priority />
          </div>
          <h1 style={{ fontSize: "1.3rem", marginBottom: "0.2rem" }}>Admin Panel</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem", fontWeight: "500" }}>Sistema de Gestión de Propuestas</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña de acceso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.8rem 0.65rem 2.4rem", background: "#fff", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", color: "var(--text)", fontSize: "0.9rem", fontFamily: "inherit", letterSpacing: "0.06em" }}
                required autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.7rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem" }} tabIndex={-1}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.8rem" }}>
                <p style={{ color: "#dc2626", fontSize: "0.8rem", fontWeight: "600", margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "0.65rem", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {loading ? <><div className="spinner" /> Ingresando...</> : 'Ingresar al Panel'}
            </button>
          </form>

          <p style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--glass-border)", fontSize: "0.7rem", color: "var(--text-muted)", opacity: 0.5, fontWeight: "600" }}>
            Orion Technology &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  );
}
