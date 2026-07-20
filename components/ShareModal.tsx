'use client';

import { useState } from 'react';
import { Mail, X, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ShareModal({ proposalId, clientName, onClose }: { proposalId: string; clientName: string; onClose: () => void }) {
  const [tab, setTab] = useState<'email' | 'qr'>('email');
  const [copied, setCopied] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/p/${proposalId}` : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailSubject = encodeURIComponent(`Propuesta Orion Technology - ${clientName}`);
  const mailBody = encodeURIComponent(`Hola,\n\nTe comparto la propuesta digital:\n${link}\n\nSaludos.`);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "var(--radius-md)", padding: "1.5rem", maxWidth: "420px", width: "90%", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "800", margin: 0 }}>Compartir Propuesta</h3>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem", background: "var(--bg-accent)", padding: "0.2rem", borderRadius: "var(--radius-sm)" }}>
          <button onClick={() => setTab('email')} style={{ flex: 1, padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.8rem", background: tab === 'email' ? '#fff' : 'transparent', color: tab === 'email' ? 'var(--text)' : 'var(--text-muted)', transition: "0.15s" }}><Mail size={14} style={{ marginRight: "0.3rem" }} /> Correo</button>
          <button onClick={() => setTab('qr')} style={{ flex: 1, padding: "0.4rem", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.8rem", background: tab === 'qr' ? '#fff' : 'transparent', color: tab === 'qr' ? 'var(--text)' : 'var(--text-muted)', transition: "0.15s" }}><ExternalLink size={14} style={{ marginRight: "0.3rem" }} /> QR</button>
        </div>

        {tab === 'email' ? (
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input type="text" value={link} readOnly style={{ flex: 1, padding: "0.5rem 0.7rem", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontFamily: "inherit", color: "var(--text)", background: "var(--bg-accent)" }} />
              <button onClick={handleCopy} className="btn-icon" style={{ background: copied ? "rgba(16,185,129,0.1)" : "var(--bg-accent)" }}>{copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}</button>
            </div>
            <a href={`mailto:?subject=${mailSubject}&body=${mailBody}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>
              <Mail size={16} /> Abrir en Correo
            </a>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", padding: "1rem", background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
              <QRCodeSVG value={link} size={200} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Escanea para abrir la propuesta</p>
          </div>
        )}
      </div>
    </div>
  );
}
