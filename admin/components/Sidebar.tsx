'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/upload', label: 'Upload', icon: '⬆️' },
  { href: '/dashboard/wallpapers', label: 'Wallpapers', icon: '🖼️' },
  { href: '/dashboard/categories', label: 'Categories', icon: '📁' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  function logout() {
    setLoggingOut(true);
    localStorage.removeItem('wv_token');
    router.push('/login');
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🖼️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>MultiArt AI</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: '8px' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#a78bfa' : 'var(--text-muted)',
              background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
