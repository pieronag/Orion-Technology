import { getProposalPublicInfo } from '@/app/actions/proposals';
import ProposalClient from './ProposalClient';
import ProposalPublicView from './ProposalPublicView';

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getProposalPublicInfo(resolvedParams.id);

  if (!result.success) {
    if (result.error === 'expired') {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
          <div style={{ textAlign: "center", maxWidth: "400px", padding: "2.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Propuesta Expirada</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>El enlace a esta propuesta ha superado su vigencia y ya no se encuentra disponible por motivos de seguridad.</p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Propuesta no encontrada</h1>
      </div>
    );
  }

  const p = result.proposal!;

  // Si tiene allowPublicView, mostrar sin gate
  if (p.allowPublicView && p.status !== 'accepted') {
    return <ProposalPublicView proposalInfo={p} />;
  }

  // Si ya fue aceptada, mostrar directamente
  if (p.status === 'accepted') {
    return <ProposalPublicView proposalInfo={p} />;
  }

  return <ProposalClient proposalInfo={p} />;
}
