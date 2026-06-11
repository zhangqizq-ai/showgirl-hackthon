export type PromptProfile = {
  id: string;
  label: string;
  description?: string;
  hint?: string;
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

export const objections = [
  // Category 1: Workload & Ecosystem Alignment
  '"Oracle is just for Oracle databases. We are moving away from Oracle software, so why would we use OCI?"',
  '"We are already using AWS Bedrock and Anthropic models for our agents, and AWS provides a more mature AI ecosystem with a wider range of services. As a result, we do not see a compelling reason to consider OCI."',
  
  // Category 2: Operational Friction & Multi-Cloud Complexity
  '"We are already deeply committed to AWS/Azure/GCP. We don\'t want a multi-cloud headache."',
  '"We don\'t want to move off AWS just to try OCI."',
  '"Why would we go through the headache of adding OCI as a second (or third/fourth) cloud if the savings are not dramatic? Unless savings are closer to 50%, the complexity may not be worth it."',
  
  // Category 3: Market Perception & Brand Reputation
  '"When we talk to developers and look at ecosystem momentum, we don\'t see Oracle anywhere."',
  '"Oracle\'s reputation with licensing and audits makes us hesitant to lock ourselves further into your ecosystem."',
  '"Is OCI mature enough? Do you have the same breadth of services and global footprint as AWS?"',
  
  // Category 4: The Agentic AI Value Proposition
  '"There\'s limited incentive to adopt OCI solely for Agentic when AWS, Azure, and GCP already host most enterprise workloads; making Oracle\'s embedded-agent value proposition far more compelling to existing Oracle customers than to enterprises whose data and AI infrastructure already run seamlessly in other clouds."',
];

// Helper function to randomly select N objections from the full list
export function getRandomObjections(count: number): string[] {
  const shuffled = [...objections].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

