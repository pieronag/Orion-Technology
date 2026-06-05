'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import { deleteProposal } from '@/app/actions/proposals';

export default function ProposalActions({ id }: { id: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteProposal(id);
    setLoading(false);
    if (result.success) {
      setShowModal(false);
      router.refresh();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <Link 
          href={`/dashboard/edit/${id}`} 
          style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "6px", color: "var(--text)", transition: "0.2s" }}
          className="hover:bg-[rgba(255,255,255,0.1)]"
          title="Editar"
        >
          <Edit2 size={16} />
        </Link>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: "rgba(239, 68, 68, 0.1)", padding: "0.5rem", borderRadius: "6px", color: "#ef4444", border: "none", cursor: "pointer", transition: "0.2s" }}
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="glass-panel" style={{ padding: "2.5rem", maxWidth: "400px", width: "90%", textAlign: "center" }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Eliminar Propuesta</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              ¿Estás seguro de que deseas eliminar esta propuesta permanentemente? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button 
                onClick={() => setShowModal(false)} 
                disabled={loading}
                className="btn btn-outline" 
                style={{ padding: "0.8rem 1.5rem" }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                disabled={loading}
                className="btn" 
                style={{ background: "#ef4444", border: "none", color: "white", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
