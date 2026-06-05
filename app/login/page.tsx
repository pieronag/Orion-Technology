'use client';

import { useState } from 'react';
import { loginAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await loginAdmin(password);
    
    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.error || 'Error desconocido');
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div className="mesh-bg"></div>

      <div className="container" style={{ display: "flex", justifyContent: "center", zIndex: 10 }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "3rem", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: "60px", height: "60px", background: "var(--bg)", border: "1px solid var(--glass-border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--primary-glow)" }}>
              <Shield size={30} color="var(--primary)" />
            </div>
          </div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Orion Admin</h1>
          <p className="text-muted" style={{ marginBottom: "2rem" }}>Sistema de Gestión de Propuestas</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <input
                type="password"
                placeholder="Contraseña de acceso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
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
                  textAlign: "center",
                  letterSpacing: "0.1em"
                }}
                required
              />
            </div>
            
            {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "600", margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", border: "none" }}
            >
              {loading ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
