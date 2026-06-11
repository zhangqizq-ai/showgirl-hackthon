import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'hackthon - Oracle OCI Generative AI Sales Coaching',
  description: 'Enterprise sales coaching with Oracle Cloud Infrastructure Generative AI. Practice objections, get instant AI feedback.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
