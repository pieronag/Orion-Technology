'use client';

import { logoutAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, FileText, PlusCircle } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div className="mesh-bg"></div>
      <style dangerouslySetInnerHTML={{ __html: `
        .dash-container { display: flex; gap: 1.5rem; padding-top: 1.5rem; padding-bottom: 3rem; flex: 1; align-items: flex-start; }
        .dash-sidebar { width: 220px; flex-shrink: 0; position: sticky; top: 80px; background: #fff; border: 1px solid var(--glass-border); border-radius: var(--radius-md); box-shadow: var(--card-shadow); }
        .dash-main { flex: 1; min-width: 0; }
        @media (max-width: 768px) {
          .dash-container { flex-direction: column; padding-top: 1rem; }
          .dash-sidebar { width: 100%; position: relative; top: 0; }
        }
      `}} />

      <div style={{ padding: "0.7rem 0", background: "#fff", borderBottom: "1px solid var(--glass-border)", zIndex: 50 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image src="/logo_white.png" alt="Orion Logo" width={90} height={30} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} priority />
          </Link>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <NotificationBell />
            <span className="badge" style={{ borderColor: "var(--primary)", background: "var(--primary-glow)", color: "var(--primary)", fontSize: "0.65rem" }}>Admin</span>
            <button onClick={handleLogout} className="btn-ghost btn-sm" style={{ color: "#ef4444", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}>
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="container dash-container">
        <aside className="dash-sidebar" style={{ padding: "0.6rem" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.7rem", borderRadius: "var(--radius-sm)", color: "var(--text)", textDecoration: "none", fontWeight: "600", fontSize: "0.85rem", transition: "background 0.15s" }} className="hover:bg-[#f5f5f7]">
              <FileText size={17} color="var(--primary)" />
              <span>Mis Propuestas</span>
            </Link>
            <Link href="/dashboard/new" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.7rem", borderRadius: "var(--radius-sm)", color: "var(--text)", textDecoration: "none", fontWeight: "600", fontSize: "0.85rem", transition: "background 0.15s" }} className="hover:bg-[#f5f5f7]">
              <PlusCircle size={17} color="var(--secondary)" />
              <span>Nueva Propuesta</span>
            </Link>
          </nav>
        </aside>
        <main className="dash-main">{children}</main>
      </div>
    </div>
  );
}
