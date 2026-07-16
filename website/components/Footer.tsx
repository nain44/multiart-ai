'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      marginTop: '80px',
      padding: '48px 0 32px',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          {/* Brand */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '20px', marginBottom: '12px' }}>
              MultiArt<span style={{ color: '#a78bfa' }}> AI</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
              Free HD & 4K wallpapers for Android and iPhone. New wallpapers added daily.
            </p>
          </div>

          {/* Browse */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Browse</div>
            {['Wallpapers', 'Categories'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`}
                style={{ display: 'block', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                {item}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Legal</div>
            {[
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms of Service', href: '/terms' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ display: 'block', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Get the App */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Get the App</div>
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '10px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              🤖 Google Play Store
            </a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              🍎 App Store
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} MultiArt AI. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Photos courtesy of <a href="https://pexels.com" style={{ color: '#a78bfa' }}>Pexels</a> &amp; <a href="https://unsplash.com" style={{ color: '#a78bfa' }}>Unsplash</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
