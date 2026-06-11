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
  { id: 'price', label: 'Price / Budget', hint: 'Respond to cost objections and ROI concerns.' },
  { id: 'timeline', label: 'Timeline', hint: 'Address urgency and deployment timing concerns.' },
  { id: 'trust', label: 'Trust / Fit', hint: 'Handle fit, credibility, and compatibility questions.' },
  { id: 'features', label: 'Features', hint: 'Answer questions about missing functionality.' },
];

export const objections = [
  'We don’t have the budget for something new right now.',
  'Your product looks interesting, but we’ve never done something like this before.',
  'I’m not convinced it will integrate cleanly with our current stack.',
  'This sounds like a good idea, but we need results within 30 days.',
  'I have other vendors I’m already evaluating, so I’m not ready to move yet.',
];
