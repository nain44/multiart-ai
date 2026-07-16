import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
      }}
    >
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🖼️</div>
        <div style={{
          fontSize: '96px', fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.3) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            ← Go Home
          </Link>
          <Link href="/wallpapers" className="btn btn-outline" style={{ padding: '12px 28px' }}>
            Browse Wallpapers
          </Link>
        </div>
      </div>
    </div>
  );
}
