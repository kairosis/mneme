import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mneme',
  description: 'Semantic vector memory — document upload and search',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
