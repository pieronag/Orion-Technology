'use client';

import { logoutAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, FileText, PlusCircle } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div className="mesh-bg"></div>

      {/* Estilos responsivos inyectados */}
      <style dangerouslySetInnerHTML={{__html: `
        .dash-container {
          display: flex;
          gap: 2rem;
          padding-top: 3rem;
          padding-bottom: 4rem;
          flex: 1;
          align-items: flex-start;
        }
        .dash-sidebar {
          width: 260px;
          flex-shrink: 0;
          position: sticky;
          top: 100px;
        }
        .dash-main {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .dash-container {
            flex-direction: column;
            padding-top: 2rem;
          }
          .dash-sidebar {
            width: 100%;
            position: relative;
            top: 0;
          }
          .nav-badge {
            display: none;
          }
        }
      `}} />

      {/* Header Compacto (ADN Web) */}
      <div style={{ padding: "1.5rem 0", background: "var(--bg)", borderBottom: "1px solid var(--glass-border)", zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/logo_white.png"
              alt="Orion Logo"
              width={120}
              height={40}
              style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }}
              priority
            />
          </Link>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <span className="badge nav-badge" style={{ borderColor: "var(--primary)", background: "var(--primary-glow)", color: "var(--primary)" }}>Admin Panel</span>
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "#ef4444", fontWeight: "700", cursor: "pointer" }}
            >
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Cuerpo del Dashboard */}
      <div className="container dash-container">
        {/* Sidebar */}
        <aside className="glass-panel dash-sidebar" style={{ padding: "1.5rem" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "8px", color: "var(--text)", textDecoration: "none", fontWeight: "600", transition: "background 0.2s" }} className="hover-scale">
              <FileText size={20} color="var(--primary)" />
              <span>Mis Propuestas</span>
            </Link>
            <Link href="/dashboard/new" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "8px", color: "var(--text)", textDecoration: "none", fontWeight: "600", transition: "background 0.2s" }} className="hover-scale">
              <PlusCircle size={20} color="var(--secondary)" />
              <span>Nueva Propuesta</span>
            </Link>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="dash-main">
          {children}
        </main>
      </div>
    </div>
  );
}
