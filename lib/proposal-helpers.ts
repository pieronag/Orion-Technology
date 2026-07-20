export type ProposalModule = {
  name: string;
  description: string;
  investment: string;
};

export type ProposalDevelopmentGroup = {
  title: string;
  description: string;
  modules: ProposalModule[];
  subtotal: string;
  timeline: string;
};

export type ProposalDifferentiator = {
  label: string;
  title: string;
  description: string;
};

export type ProposalMarketing = {
  name: string;
  description: string;
  investment: string;
};

export type ProposalMockup = {
  url: string;
  caption: string;
};

export type ProposalPayment = {
  percentage: string;
  description: string;
  amount: string;
};

export type ProposalCommercial = {
  total: string;
  timeline: string;
  payment: ProposalPayment[];
  intellectualProperty: string;
  warranty: string;
};

export type ProposalContent = {
  authorName: string;
  authorRole: string;
  title: string;
  subtitle: string;
  clientName: string;
  introObjectives: string;
  developmentGroups: ProposalDevelopmentGroup[];
  comparativeAnalysis: string;
  integration: string;
  differentiators: ProposalDifferentiator[];
  marketing: ProposalMarketing[];
  mockups: ProposalMockup[];
  commercial: ProposalCommercial;
  tags: string[];
};

export function createEmptyContent(): ProposalContent {
  return {
    authorName: '',
    authorRole: '',
    title: '',
    subtitle: '',
    clientName: '',
    introObjectives: '',
    developmentGroups: [],
    comparativeAnalysis: '',
    integration: '',
    differentiators: [],
    marketing: [],
    mockups: [],
    tags: [],
    commercial: {
      total: '',
      timeline: '',
      payment: [],
      intellectualProperty: '',
      warranty: '',
    },
  };
}

export function isOldFormat(data: any): boolean {
  return data && typeof data === 'object' && 'intro' in data && 'development' in data;
}

export function migrateOldFormat(data: any): ProposalContent {
  const old = data;
  const groups: ProposalDevelopmentGroup[] = [];

  if (old.development?.web) {
    groups.push({
      title: old.development.web.title || 'Fase 1: Desarrollo Web',
      description: old.development.web.desc || '',
      modules: (old.development.web.items || []).map((item: any) => ({
        name: item.title || '',
        description: item.desc || '',
        investment: '',
      })),
      subtotal: '',
      timeline: '',
    });
  }

  if (old.development?.system) {
    groups.push({
      title: old.development.system.title || 'Fase 2: Desarrollo del Sistema',
      description: old.development.system.desc || '',
      modules: (old.development.system.items || []).map((item: any) => ({
        name: item.title || '',
        description: item.desc || '',
        investment: '',
      })),
      subtotal: '',
      timeline: '',
    });
  }

  const oldObjectives = (old.objectives || []).map((o: any) => `### ${o.title}\n${o.desc}`).join('\n\n');
  const introText = old.intro || '';
  const combinedIntro = oldObjectives ? `${introText}\n\n${oldObjectives}` : introText;

  const paymentItems: ProposalPayment[] = (old.commercial?.payment || []).map((p: string) => ({
    percentage: '',
    description: p,
    amount: '',
  }));

  return {
    authorName: '',
    authorRole: '',
    title: old.title || '',
    subtitle: '',
    clientName: old.clientName || '',
    introObjectives: combinedIntro,
    developmentGroups: groups,
    comparativeAnalysis: '',
    integration: old.integration || '',
    differentiators: [],
    marketing: [],
    mockups: [],
    tags: old.tags || [],
    commercial: {
      total: old.commercial?.total || '',
      timeline: old.commercial?.time || '',
      payment: paymentItems,
      intellectualProperty: '',
      warranty: old.commercial?.warranty || '',
    },
  };
}

export function parseUF(value: string): number {
  const match = value.match(/[\d.]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(',', '.')) || 0;
}

export function sumModulesUF(modules: ProposalModule[]): number {
  return modules.reduce((sum, m) => sum + parseUF(m.investment), 0);
}

export function sumPayments(payments: ProposalPayment[]): string {
  const total = payments.reduce((sum, p) => sum + parseUF(p.amount), 0);
  return total ? `${total.toFixed(1)} UF` : '';
}

export function autoLabel(index: number): string {
  return String.fromCharCode(65 + index);
}
