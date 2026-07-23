'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/app/actions/nexus/settings';
import { Settings, Save, Plus, X } from 'lucide-react';

export default function SettingsPage() {
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [defaultWarranty, setDefaultWarranty] = useState(30);
  const [newTech, setNewTech] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(r => {
      if (r.success) {
        setTechnicians(r.settings.technicians);
        setBranches(r.settings.branches);
        setDefaultWarranty(r.settings.defaultWarranty);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const r = await saveSettings({ technicians, branches, defaultWarranty });
    if (r.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando configuración...</div>;

  return (
    <div style={{ animation: 'fade-up 0.4s ease' }}>
      <style>{`@media (max-width: 640px) {
        .set-add-row { flex-direction: column !important; gap: 0.4rem !important; }
        .set-add-row .btn { width: 100% !important; }
      }`}</style>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
        <Settings size={24} style={{ color: 'var(--text-muted)' }} /> Ajustes
      </h1>

      <div className="bento-grid">
        <div className="bento-col-5">
          {/* Técnicos */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Técnicos</h3>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {technicians.map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: 'var(--primary-glow)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                  {t}
                  <button onClick={() => setTechnicians(technicians.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="set-add-row" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <input placeholder="Nombre del técnico" value={newTech} onChange={e => setNewTech(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newTech.trim() && (setTechnicians([...technicians, newTech.trim()]), setNewTech('')))}
                style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => { if (newTech.trim()) { setTechnicians([...technicians, newTech.trim()]); setNewTech(''); } }} className="btn btn-primary btn-sm" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><Plus size={14} /> Agregar</button>
            </div>
          </div>

          {/* Sucursales */}
          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Sucursales</h3>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {branches.map((b, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                  {b}
                  <button onClick={() => setBranches(branches.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="set-add-row" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <input placeholder="Nombre de sucursal" value={newBranch} onChange={e => setNewBranch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newBranch.trim() && (setBranches([...branches, newBranch.trim()]), setNewBranch('')))}
                style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => { if (newBranch.trim()) { setBranches([...branches, newBranch.trim()]); setNewBranch(''); } }} className="btn btn-primary btn-sm" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><Plus size={14} /> Agregar</button>
            </div>
          </div>
        </div>

        <div className="bento-col-7">
          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Configuración general</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Garantía por defecto (días)</label>
                <input type="number" value={defaultWarranty} onChange={e => setDefaultWarranty(parseInt(e.target.value) || 0)}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', width: '100px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>WhatsApp</label>
                <input value="+56950194398" disabled
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', width: '200px', opacity: 0.6 }} />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: saving ? 0.5 : 1 }}>
                <Save size={16} /> {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar configuración'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
