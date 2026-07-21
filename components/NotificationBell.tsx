'use client';

import { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead } from '@/app/actions/proposals';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n: any) => !n.read).length;

  useEffect(() => {
    const fetch = async () => {
      const res = await getNotifications();
      if (res.success && res.notifications) setNotifications(res.notifications as any[]);
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n: any) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="btn-icon" style={{ position: 'relative' }}>
        <Bell size={18} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '360px', maxHeight: '400px', overflowY: 'auto', background: 'var(--bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', zIndex: 100, padding: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Notificaciones</span>
            <button onClick={() => setOpen(false)} className="btn-icon" style={{ width: '24px', height: '24px' }}><X size={14} /></button>
          </div>
          {notifications.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin notificaciones</div>
          )}
          {notifications.map((n: any) => (
            <div key={n.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-sm)', background: n.read ? 'transparent' : 'var(--primary-glow)', marginBottom: '0.2rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={16} color={n.read ? 'var(--text-muted)' : '#10b981'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: n.read ? '500' : '700', color: 'var(--text)', lineHeight: '1.4' }}>{n.message}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {n.createdAt ? format(n.createdAt, "d MMM 'a las' HH:mm", { locale: es }) : ''}
                </div>
              </div>
              {!n.read && (
                <button onClick={() => handleMarkRead(n.id)} className="btn-icon" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
