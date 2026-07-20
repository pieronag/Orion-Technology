'use client';

import { useState } from 'react';
import { unlockProposal } from '@/app/actions/proposals';
import { isOldFormat, migrateOldFormat } from '@/lib/proposal-helpers';
import type { ProposalContent } from '@/lib/proposal-helpers';
import { Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import ProposalRenderer from './ProposalRenderer';

export default function ProposalClient({ proposalInfo }: { proposalInfo: any }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalContent | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await unlockProposal(proposalInfo.id, password);
    if (result.success && result.content) {
      try {
        const parsed = JSON.parse(result.content);
        setProposalData(isOldFormat(parsed) ? migrateOldFormat(parsed) : parsed);
      } catch {
        setProposalData({ _raw: result.content } as any);
      }
    } else {
      setError(result.error || 'Acceso denegado');
    }
    setLoading(false);
  };

  if (!proposalData) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div className="mesh-bg"></div>
        <div className="container" style={{ display: "flex", justifyContent: "center", zIndex: 10 }}>
          <div style={{ width: "100%", maxWidth: "400px", padding: "2.5rem", textAlign: "center", background: "#fff", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)", boxShadow: "var(--card-shadow)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <Image src="/logo_white.png" alt="Orion Logo" width={100} height={33} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0)' }} priority />
            </div>
            <div style={{ width: "50px", height: "50px", margin: "0 auto 1rem", background: "var(--bg-accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={24} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: "1.3rem", marginBottom: "0.3rem" }}>Acceso Seguro</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              Esta propuesta es confidencial y ha sido preparada para <strong>{proposalInfo.clientName}</strong>.
            </p>
            <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.7rem 1rem", background: "#fff", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: "0.9rem", fontFamily: "inherit", textAlign: "center", letterSpacing: "0.15em" }} required />
              {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", fontWeight: "600", margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", border: "none", justifyContent: "center" }}>
                {loading ? 'Verificando...' : 'Desbloquear'} {!loading && <ChevronRight size={18} />}
              </button>
            </form>
            <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
              <ShieldCheck size={14} color="#10b981" /> Encriptación de Grado Militar
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <ProposalRenderer data={proposalData} proposalInfo={proposalInfo} />;
}
