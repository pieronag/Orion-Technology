import { getProposalPublicInfo } from '@/app/actions/proposals';
import ProposalClient from './ProposalClient';

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getProposalPublicInfo(resolvedParams.id);

  if (!result.success) {
    if (result.error === 'expired') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white font-['Outfit']">
          <div className="text-center max-w-md p-8 glass-panel border border-[rgba(255,255,255,0.1)] rounded-xl bg-[#18181b]/80 backdrop-blur-xl">
            <h1 className="text-3xl font-bold mb-4 text-red-400">Propuesta Expirada</h1>
            <p className="text-[#a1a1aa] mb-6">El enlace a esta propuesta ha superado su vigencia de 15 días y ya no se encuentra disponible por motivos de seguridad.</p>
            <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee]">Orion Technology</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <h1 className="text-2xl font-bold">Propuesta no encontrada (404)</h1>
      </div>
    );
  }

  return <ProposalClient proposalInfo={result.proposal!} />;
}
