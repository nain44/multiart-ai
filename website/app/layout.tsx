import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MultiArt AI — Free Stunning HD & 4K Wallpapers',
  description: 'Download thousands of free HD and 4K wallpapers for Android and iPhone. Nature, space, abstract, architecture, dark themes and more.',
  keywords: 'free wallpapers, 4K wallpapers, HD wallpapers, phone wallpapers, Android wallpapers, iPhone wallpapers',
  openGraph: {
    title: 'MultiArt AI — Free HD & 4K Wallpapers',
    description: 'Download stunning free wallpapers for your phone.',
    siteName: 'MultiArt AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
