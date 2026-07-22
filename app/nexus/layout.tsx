'use client';

import { useState, useEffect } from 'react';
import { logoutAdmin } from '@/app/actions/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut, LayoutDashboard, Users, Monitor, FileText, ClipboardList,
  ShoppingCart, DollarSign, BarChart3, Settings, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/nexus', label: 'Panel', icon: LayoutDashboard },
  { href: '/nexus/clients', label: 'Clientes', icon: Users },
  { href: '/nexus/equipments', label: 'Equipos', icon: Monitor },
  { href: '/nexus/quotes', label: 'Cotizaciones', icon: FileText },
  { href: '/nexus/work-orders', label: 'Ordenes', icon: ClipboardList },
  { href: '/nexus/inventory', label: 'Inventario', icon: ShoppingCart },
  { href: '/nexus/payments', label: 'Pagos', icon: DollarSign },
  { href: '/nexus/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/nexus/settings', label: 'Ajustes', icon: Settings },
];

export default function NexusLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      <div className="mesh-bg"></div>
      <style>{`
        .nx-sb { width: ${sidebarOpen ? '240px' : '64px'}; transition: width 0.3s cubic-bezier(0.4,0,0.2,1); background: rgba(255,255,255,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 30; overflow: hidden; }
        .nx-sb:hover { overflow-y: auto; }
        .nx-main { margin-left: ${sidebarOpen ? '240px' : '64px'}; flex: 1; min-height: 100vh; transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1); padding: 1.5rem; }
        .nx-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.75rem; border-radius: 10px; color: var(--text-secondary); text-decoration: none; font-weight: 600; font-size: 0.82rem; transition: all 0.2s; white-space: nowrap; margin: 0.1rem 0.5rem; position: relative; }
        .nx-item:hover { background: var(--bg-accent); color: var(--text); }
        .nx-item.active { background: var(--primary-soft); color: var(--primary); font-weight: 700; }
        .nx-item.active::before { content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%); width: 3px; height: 20px; border-radius: 3px; background: var(--primary); }
        .nx-label { opacity: ${sidebarOpen ? 1 : 0}; transition: opacity 0.2s; }
        @media (max-width: 768px) {
          .nx-sb { width: ${sidebarOpen ? '260px' : '0px'} !important; }
          .nx-main { margin-left: 0 !important; padding-top: 3.5rem !important; }
          .nx-mb { display: flex !important; z-index: 35 !important; }
        }
      `}</style>

      {/* Mobile bar */}
      <div className="nx-mb" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: '50px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', zIndex: 35, alignItems: 'center', padding: '0 1rem', gap: '0.5rem' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-icon" style={{ background: 'var(--bg-accent)' }}><Menu size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Image src="/logo_white.png" alt="Orion" width={65} height={22} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary)', background: 'var(--primary-soft)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Nexus</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="nx-sb" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Logo area */}
        <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', minHeight: '56px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-icon" style={{ flexShrink: 0, background: 'var(--bg-accent)', width: '30px', height: '30px' }} title={sidebarOpen ? 'Colapsar' : 'Expandir'}>
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          {sidebarOpen && (
            <>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                <Image src="/logo_white.png" alt="Orion" width={68} height={23} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} />
              </Link>
              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary)', background: 'var(--primary-soft)', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>Nexus</span>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.6rem 0', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = item.href === '/nexus' ? pathname === '/nexus' : pathname.startsWith(item.href + '/') || pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nx-item ${isActive ? 'active' : ''}`}
                style={!sidebarOpen ? { justifyContent: 'center', padding: '0.55rem', margin: '0.1rem 0.3rem' } : {}}>
                <Icon size={19} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span className="nx-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.6rem 0.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: sidebarOpen ? '0.65rem' : '0', justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%', padding: sidebarOpen ? '0.6rem 0.75rem' : '0.55rem', borderRadius: '10px', border: 'none', background: 'var(--danger-soft)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 650, fontSize: '0.8rem', fontFamily: 'var(--font)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}>
            <LogOut size={17} />
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="nx-main">{children}</main>
    </div>
  );
}
