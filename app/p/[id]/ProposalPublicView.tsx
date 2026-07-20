'use client';

import { useState, useEffect } from 'react';
import { getProposalPublicContent } from '@/app/actions/proposals';
import { isOldFormat, migrateOldFormat } from '@/lib/proposal-helpers';
import type { ProposalContent } from '@/lib/proposal-helpers';
import ProposalRenderer from './ProposalRenderer';

export default function ProposalPublicView({ proposalInfo }: { proposalInfo: any }) {
  const [data, setData] = useState<ProposalContent | null>(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getProposalPublicContent(proposalInfo.id);
      if (res.success && res.content) {
        try {
          const parsed = JSON.parse(res.content);
          setData(isOldFormat(parsed) ? migrateOldFormat(parsed) : parsed);
        } catch {
          setData({ _raw: res.content } as any);
        }
        setFiles(res.files || []);
      } else {
        setError(res.error || 'Error al cargar');
      }
    };
    fetch();
  }, [proposalInfo.id]);

  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;

  return <ProposalRenderer data={data} proposalInfo={proposalInfo} files={files} />;
}
