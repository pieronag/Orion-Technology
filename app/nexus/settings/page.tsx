'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Plus, X } from 'lucide-react';

export default function SettingsPage() {
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [defaultWarranty, setDefaultWarranty] = useState(30);
  const [newTech, setNewTech] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedTechs = localStorage.getItem('nexus-technicians');
    const savedBranches = localStorage.getItem('nexus-branches');
    const savedWarranty = localStorage.getItem('nexus-default-warranty');
    if (savedTechs) setTechnicians(JSON.parse(savedTechs));
    if (savedBranches) setBranches(JSON.parse(savedBranches));
    if (savedWarranty) setDefaultWarranty(parseInt(savedWarranty));
  }, []);

  const handleSave = () => {
    localStorage.setItem('nexus-technicians', JSON.stringify(technicians));
    localStorage.setItem('nexus-branches', JSON.stringify(branches));
    localStorage.setItem('nexus-default-warranty', String(defaultWarranty));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
        <Settings size={22} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} /> Ajustes
      </h1>

      <div className="bento-grid">
        <div className="bento-col-5">
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Técnicos</h3>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              {technicians.map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: 'var(--primary-glow)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                  {t}
                  <button onClick={() => setTechnicians(technicians.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, lineHeight: 1, fontSize: '0.7rem' }}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input placeholder="Nombre del técnico" value={newTech} onChange={e => setNewTech(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newTech.trim() && (setTechnicians([...technicians, newTech.trim()]), setNewTech('')))}
                style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => { if (newTech.trim()) { setTechnicians([...technicians, newTech.trim()]); setNewTech(''); } }} className="btn btn-primary btn-sm"><Plus size={14} /></button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Sucursales</h3>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              {branches.map((b, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                  {b}
                  <button onClick={() => setBranches(branches.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input placeholder="Nombre de sucursal" value={newBranch} onChange={e => setNewBranch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newBranch.trim() && (setBranches([...branches, newBranch.trim()]), setNewBranch('')))}
                style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none' }} />
              <button onClick={() => { if (newBranch.trim()) { setBranches([...branches, newBranch.trim()]); setNewBranch(''); } }} className="btn btn-primary btn-sm"><Plus size={14} /></button>
            </div>
          </div>
        </div>

        <div className="bento-col-7">
          <div className="card">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Configuración general</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Garantía por defecto (días)</label>
                <input type="number" value={defaultWarranty} onChange={e => setDefaultWarranty(parseInt(e.target.value) || 0)}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '100px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>WhatsApp número</label>
                <input value="+56950194398" disabled
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', width: '200px', opacity: 0.6 }} />
              </div>
              <button onClick={handleSave} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Save size={16} /> {saved ? 'Guardado ✓' : 'Guardar configuración'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
