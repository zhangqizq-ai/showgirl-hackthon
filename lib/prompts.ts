export type PromptProfile = {
  id: string;
  label: string;
  description?: string;
  hint?: string;
};

export type Objection = {
  text: string;
  category: string;
};

export const personas: PromptProfile[] = [
  { id: 'technical', label: 'Technical Buyer', description: 'Concerned about integration, uptime, and ROI.' },
  { id: 'economic', label: 'Economic Buyer', description: 'Focused on budget, value, and decision criteria.' },
  { id: 'user', label: 'End User', description: 'Wants simplicity, support, and productivity gains.' },
];

export const categories: PromptProfile[] = [
  { id: 'ecosystem', label: 'Workload & Ecosystem Alignment', hint: 'Oracle ecosystem fit and database concerns.' },
  { id: 'multicloud', label: 'Operational Friction & Multi-Cloud', hint: 'Multi-cloud complexity and switching costs.' },
  { id: 'perception', label: 'Market Perception & Reputation', hint: 'Brand reputation and market momentum.' },
  { id: 'agentic', label: 'Agentic AI Value Proposition', hint: 'Agent AI positioning against competitors.' },
];

export const objections: Objection[] = [
  // Category 1: Workload & Ecosystem Alignment
  {
    text: '"Oracle is just for Oracle databases. We are moving away from Oracle software, so why would we use OCI?"',
    category: 'ecosystem',
  },
  {
    text: '"We are already using AWS Bedrock and Anthropic models for our agents, and AWS provides a more mature AI ecosystem with a wider range of services. As a result, we do not see a compelling reason to consider OCI."',
    category: 'ecosystem',
  },
  {
    text: '"We have standardized on a broad open-source stack, and Oracle feels like a proprietary, niche play rather than a modern multi-cloud platform."',
    category: 'ecosystem',
  },
  
  // Category 2: Operational Friction & Multi-Cloud Complexity
  {
    text: '"We are already deeply committed to AWS/Azure/GCP. We don\'t want a multi-cloud headache."',
    category: 'multicloud',
  },
  {
    text: '"We don\'t want to move off AWS just to try OCI."',
    category: 'multicloud',
  },
  {
    text: '"Why would we go through the headache of adding OCI as a second (or third/fourth) cloud if the savings are not dramatic? Unless savings are closer to 50%, the complexity may not be worth it."',
    category: 'multicloud',
  },
  
  // Category 3: Market Perception & Brand Reputation
  {
    text: '"When we talk to developers and look at ecosystem momentum, we don\'t see Oracle anywhere."',
    category: 'perception',
  },
  {
    text: '"Oracle\'s reputation with licensing and audits makes us hesitant to lock ourselves further into your ecosystem."',
    category: 'perception',
  },
  {
    text: '"Is OCI mature enough? Do you have the same breadth of services and global footprint as AWS?"',
    category: 'perception',
  },
  
  // Category 4: The Agentic AI Value Proposition
  {
    text: '"There\'s limited incentive to adopt OCI solely for Agentic when AWS, Azure, and GCP already host most enterprise workloads; making Oracle\'s embedded-agent value proposition far more compelling to existing Oracle customers than to enterprises whose data and AI infrastructure already run seamlessly in other clouds."',
    category: 'agentic',
  },
  {
    text: '"The agentic AI pitch sounds interesting, but we already have automation and co-pilot tooling on AWS/Azure. It\'s hard to justify another platform unless the value is very specific."',
    category: 'agentic',
  },
  {
    text: '"Even if OCI has a compelling agent story, our data and AI operations already run well in other clouds, so an extra migration path feels like more risk than reward."',
    category: 'agentic',
  },
];

// Helper function to randomly select N objections from the full list, optionally filtered by category
export function getRandomObjections(count: number, category?: string): Objection[] {
  const filtered = category ? objections.filter(obj => obj.category === category) : objections;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, filtered.length));
}

