'use client';

import { useState, useEffect } from 'react';
import { getProposals } from '@/app/actions/proposals';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Clock, CheckCircle2, Eye, Search, Copy, Check, AlertTriangle, Tag, Columns, List, Share2, Download, Mail, Unlock } from 'lucide-react';
import ProposalActions from '@/components/ProposalActions';
import KanbanBoard from '@/components/KanbanBoard';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import ShareModal from '@/components/ShareModal';

type Proposal = {
  id: string;
  title: string;
  clientName: string;
  status: string;
  tags: string[];
  createdAt: number;
  expiresAt: number;
};

export default function DashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareModalId, setShareModalId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getProposals();
      if (result.success && result.proposals) {
        setProposals(result.proposals);
      } else {
        setError('Error cargando propuestas');
      }
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const now = Date.now();
  const dayMs = 86400000;

  const allTags = [...new Set(proposals.flatMap(p => p.tags || []))].sort();

  const filtered = proposals.filter((p) => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesTag = !tagFilter || (p.tags || []).includes(tagFilter);
    return matchesSearch && matchesStatus && matchesTag;
  });

  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/p/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    const headers = 'Cliente,Proyecto,Estado,Creada,Expira,Tags\n';
    const rows = proposals.map(p => {
      const created = format(p.createdAt, 'yyyy-MM-dd');
      const expires = format(p.expiresAt, 'yyyy-MM-dd');
      const tags = (p.tags || []).join(';');
      return `"${p.clientName}","${p.title}","${p.status}","${created}","${expires}","${tags}"`;
    }).join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'propuestas.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Cargando propuestas...</div>;
  if (error) return <div style={{ padding: "2rem", color: "#ef4444" }}>{error}</div>;

  const statusTabs = [
    { key: 'all', label: 'Todas', count: proposals.length },
    { key: 'sent', label: 'Enviadas', count: proposals.filter(p => p.status === 'sent' && now <= p.expiresAt).length },
    { key: 'viewed', label: 'Vistas', count: proposals.filter(p => p.status === 'viewed').length },
    { key: 'accepted', label: 'Aceptadas', count: proposals.filter(p => p.status === 'accepted').length },
  ];

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .search-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .status-tabs { display: flex; gap: 0.35rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .status-tab { padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid var(--glass-border); background: transparent; color: var(--text-muted); font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-family: inherit; }
        .status-tab:hover { background: rgba(255,255,255,0.05); color: var(--text); }
        .status-tab.active { background: var(--primary-glow); border-color: var(--primary); color: var(--primary); }
        @media (max-width: 768px) {
          .dash-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .dash-title { font-size: 1.6rem !important; }
          .search-bar { flex-direction: column; }
        }
      `}} />

      <div className="dash-header">
        <div>
          <h1 className="dash-title" style={{ fontSize: "1.8rem", letterSpacing: "-0.03em", marginBottom: "0.2rem" }}>Propuestas</h1>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>Gestiona tus propuestas activas.</p>
        </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.25rem", background: "var(--bg-accent)", padding: "0.2rem", borderRadius: "var(--radius-sm)" }}>
              <button onClick={() => setViewMode('list')} className="btn-icon" style={{ background: viewMode === 'list' ? 'var(--bg)' : 'transparent', boxShadow: viewMode === 'list' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }} title="Vista Lista"><List size={16} /></button>
              <button onClick={() => setViewMode('kanban')} className="btn-icon" style={{ background: viewMode === 'kanban' ? 'var(--bg)' : 'transparent', boxShadow: viewMode === 'kanban' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }} title="Vista Kanban"><Columns size={16} /></button>
            </div>
            <button onClick={exportCSV} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Download size={14} /> CSV</button>
            <Link href="/dashboard/new" className="btn btn-primary">Nueva Propuesta</Link>
          </div>
      </div>

      {/* Analytics */}
      <AnalyticsPanel proposals={filtered} />

      {/* Search Bar */}
      <div className="search-bar">
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text" placeholder="Buscar por cliente o proyecto..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "0.8rem 1rem 0.8rem 2.8rem", background: "var(--bg)", border: "1px solid var(--glass-border)", borderRadius: "10px", color: "var(--text)", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {statusTabs.map((tab) => (
          <button key={tab.key} className={`status-tab ${statusFilter === tab.key ? 'active' : ''}`} onClick={() => setStatusFilter(tab.key)}>
            {tab.label} <span style={{ opacity: 0.6 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="status-tabs" style={{ marginBottom: "0.75rem" }}>
          <button className={`status-tab ${!tagFilter ? 'active' : ''}`} onClick={() => setTagFilter('')} style={{ fontSize: "0.75rem" }}>
            <Tag size={12} /> Todas
          </button>
          {allTags.map((tag) => (
            <button key={tag} className={`status-tab ${tagFilter === tag ? 'active' : ''}`} onClick={() => setTagFilter(tag)} style={{ fontSize: "0.75rem" }}>
              <Tag size={12} /> {tag}
            </button>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <KanbanBoard proposals={filtered} />
      )}

      {/* List View */}
      {viewMode === 'list' && (
      <div className="glass-panel" style={{ padding: "0", overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", minWidth: "650px" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "0.8rem 1rem", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cliente / Proyecto</th>
              <th style={{ padding: "0.8rem 1rem", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fechas</th>
              <th style={{ padding: "0.8rem 1rem", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</th>
              <th style={{ padding: "0.8rem 1rem", color: "var(--text-muted)", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                  {searchTerm ? 'No se encontraron propuestas con ese criterio.' : 'No hay propuestas creadas aún.'}
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const isExpired = now > p.expiresAt;
              const expiresSoon = !isExpired && (p.expiresAt - now) <= 3 * dayMs;

              let statusConfig = {
                icon: Clock, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", label: "Enviada"
              };
              if (isExpired) {
                statusConfig = { icon: CheckCircle2, color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", label: "Expirada" };
              } else if (p.status === 'viewed') {
                statusConfig = { icon: Eye, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", label: "Vista" };
              } else if (p.status === 'accepted') {
                statusConfig = { icon: CheckCircle2, color: "var(--primary)", bg: "var(--primary-glow)", border: "rgba(124, 58, 237, 0.3)", label: "Aceptada" };
              }

              const StatusIcon = statusConfig.icon;

              return (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--glass-border)", transition: "background 0.2s" }} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "1.1rem", marginBottom: "0.2rem" }}>{p.clientName}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{p.title}</div>
                        {(p.tags || []).length > 0 && (
                          <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                            {p.tags.map((tag: string) => (
                              <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", padding: "0.1rem 0.4rem", background: "var(--primary-glow)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "999px", fontSize: "0.6rem", fontWeight: "700", color: "var(--primary)" }}>
                                <Tag size={10} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {expiresSoon && !isExpired && (
                        <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <div style={{ fontSize: "0.85rem", marginBottom: "0.15rem" }}>
                      Creada: <span style={{ color: "var(--text-muted)" }}>{format(p.createdAt, "d MMM yyyy", { locale: es })}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: isExpired ? "#ef4444" : expiresSoon ? "#f59e0b" : "var(--primary)" }}>
                      Expira: {format(p.expiresAt, "d MMM yyyy", { locale: es })}
                      {expiresSoon && !isExpired && ` (${Math.ceil((p.expiresAt - now) / dayMs)}d)`}
                    </div>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.7rem", borderRadius: "20px", background: statusConfig.bg, border: `1px solid ${statusConfig.border}`, color: statusConfig.color, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      <StatusIcon size={14} /> {statusConfig.label}
                    </div>
                  </td>
                  <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
                      <button
                        onClick={() => copyLink(p.id)}
                        style={{ background: copiedId === p.id ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "6px", color: copiedId === p.id ? "#10b981" : "var(--text)", border: "none", cursor: "pointer", transition: "0.2s" }}
                        title={copiedId === p.id ? "Copiado!" : "Copiar enlace"}
                      >
                        {copiedId === p.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => setShareModalId(p.id)}
                        style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "6px", color: "var(--text)", border: "none", cursor: "pointer", transition: "0.2s" }}
                        title="Compartir"
                      >
                        <Share2 size={16} />
                      </button>
                      <a href={`/p/${p.id}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--secondary)", textDecoration: "none", fontWeight: "700", fontSize: "0.9rem", transition: "transform 0.2s", padding: "0.5rem" }} className="hover-scale" title="Ver Propuesta">
                        <ExternalLink size={16} />
                      </a>
                      <div style={{ width: "1px", height: "20px", background: "var(--glass-border)" }}></div>
                      <ProposalActions id={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {shareModalId && (
        <ShareModal proposalId={shareModalId} clientName={proposals.find(p => p.id === shareModalId)?.clientName || ''} onClose={() => setShareModalId(null)} />
      )}
    </div>
  );
}
