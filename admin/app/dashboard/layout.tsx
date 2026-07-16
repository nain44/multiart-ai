'use client';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        padding: '32px',
        maxWidth: 'calc(100vw - var(--sidebar-width))',
      }}>
        {children}
      </main>
    </div>
  );
}
