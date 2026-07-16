import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MultiArt AI Admin',
  description: 'MultiArt AI Content Management Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
