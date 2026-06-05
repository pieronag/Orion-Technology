import { getProposals } from '@/app/actions/proposals';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Clock, CheckCircle2, Eye } from 'lucide-react';
import ProposalActions from '@/components/ProposalActions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getProposals();
  
  if (!result.success || !result.proposals) {
    return <div style={{ padding: "2rem", color: "#ef4444" }}>Error cargando propuestas</div>;
  }

  const { proposals } = result;

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
        @media (max-width: 768px) {
          .dash-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .dash-title { font-size: 2rem !important; }
        }
      `}} />
      <div className="dash-header">
        <div>
          <h1 className="dash-title" style={{ fontSize: "2.5rem", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Propuestas Enviadas</h1>
          <p className="text-muted" style={{ fontSize: "1.1rem" }}>Gestiona y visualiza el estado de tus propuestas activas.</p>
        </div>
        <Link 
          href="/dashboard/new" 
          className="btn btn-primary"
        >
          Nueva Propuesta
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: "0", overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "1.5rem", color: "var(--text-muted)", fontWeight: "600" }}>Cliente / Proyecto</th>
              <th style={{ padding: "1.5rem", color: "var(--text-muted)", fontWeight: "600" }}>Fechas</th>
              <th style={{ padding: "1.5rem", color: "var(--text-muted)", fontWeight: "600" }}>Estado</th>
              <th style={{ padding: "1.5rem", color: "var(--text-muted)", fontWeight: "600", textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No hay propuestas creadas aún.
                </td>
              </tr>
            )}
            {proposals.map((p) => {
              const now = Date.now();
              const isExpired = now > p.expiresAt;
              
              let statusConfig = {
                icon: Clock,
                color: "#3b82f6",
                bg: "rgba(59, 130, 246, 0.1)",
                border: "rgba(59, 130, 246, 0.3)",
                label: "Enviada"
              };

              if (isExpired) {
                statusConfig = {
                  icon: CheckCircle2,
                  color: "#ef4444",
                  bg: "rgba(239, 68, 68, 0.1)",
                  border: "rgba(239, 68, 68, 0.3)",
                  label: "Expirada"
                };
              } else if (p.status === 'viewed') {
                statusConfig = {
                  icon: Eye,
                  color: "#10b981",
                  bg: "rgba(16, 185, 129, 0.1)",
                  border: "rgba(16, 185, 129, 0.3)",
                  label: "Vista"
                };
              } else if (p.status === 'accepted') {
                statusConfig = {
                  icon: CheckCircle2,
                  color: "var(--primary)",
                  bg: "var(--primary-glow)",
                  border: "rgba(124, 58, 237, 0.3)",
                  label: "Aceptada"
                };
              }

              const StatusIcon = statusConfig.icon;

              return (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--glass-border)", transition: "background 0.2s" }} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td style={{ padding: "1.5rem" }}>
                    <div style={{ fontWeight: "800", fontSize: "1.1rem", marginBottom: "0.2rem" }}>{p.clientName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{p.title}</div>
                  </td>
                  <td style={{ padding: "1.5rem" }}>
                    <div style={{ fontSize: "0.95rem", marginBottom: "0.2rem" }}>
                      Creada: <span style={{ color: "var(--text-muted)" }}>{format(p.createdAt, "d MMM yyyy", { locale: es })}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: isExpired ? "#ef4444" : "var(--primary)" }}>
                      Expira: {format(p.expiresAt, "d MMM yyyy", { locale: es })}
                    </div>
                  </td>
                  <td style={{ padding: "1.5rem" }}>
                    <div style={{ 
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      padding: "0.4rem 0.8rem", borderRadius: "20px",
                      background: statusConfig.bg, border: `1px solid ${statusConfig.border}`,
                      color: statusConfig.color, fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase"
                    }}>
                      <StatusIcon size={14} /> {statusConfig.label}
                    </div>
                  </td>
                  <td style={{ padding: "1.5rem", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
                      <a 
                        href={`/p/${p.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--secondary)", textDecoration: "none", fontWeight: "700", fontSize: "0.9rem", transition: "transform 0.2s" }}
                        className="hover-scale"
                        title="Ver Propuesta"
                      >
                        <ExternalLink size={16} /> Ver
                      </a>
                      <div style={{ width: "1px", height: "20px", background: "var(--glass-border)" }}></div>
                      <ProposalActions id={p.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
