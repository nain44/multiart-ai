import Link from 'next/link';
import { api } from '../lib/api';

export default async function HomePage() {
  let featured: any[] = [];
  let categories: any[] = [];

  try {
    [featured, categories] = await Promise.all([api.featured(), api.categories()]);
  } catch (e) {
    // Graceful fallback if API not running
  }

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Background glow orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '99px',
            fontSize: '13px', fontWeight: 600, color: '#a78bfa',
            marginBottom: '28px',
          }}>
            ✨ Free &amp; No Ads
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: '24px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #fff 0%, #e0d7ff 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Stunning Wallpapers</span>
            <br />
            <span style={{ color: 'var(--text-muted)', fontSize: '85%' }}>for Your Phone.</span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Download thousands of free HD &amp; 4K wallpapers. Updated daily, organized by category.
            Always free, always beautiful.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/wallpapers" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 28px' }}>
              Browse Wallpapers →
            </Link>
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '16px', padding: '14px 28px' }}>
              📱 Download App
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '56px', flexWrap: 'wrap' }}>
            {[
              { value: '10,000+', label: 'Wallpapers' },
              { value: '20+', label: 'Categories' },
              { value: '4K', label: 'Resolution' },
              { value: '100%', label: 'Free' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '8px' }}>Browse by Category</h2>
            <p className="section-sub" style={{ marginBottom: '36px' }}>Find exactly the vibe you're looking for</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map((cat: any) => (
                <Link key={cat._id} href={`/categories/${cat.slug}`} className="chip">
                  <span>{cat.icon}</span> {cat.name}
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({cat.wallpaperCount})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Wallpapers ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding: '0 0 80px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <div>
                <h2 className="section-title">Most Popular</h2>
                <p className="section-sub">Top picks from our collection</p>
              </div>
              <Link href="/wallpapers" className="btn btn-outline" style={{ fontSize: '14px', padding: '10px 20px' }}>
                View All →
              </Link>
            </div>

            <div className="wg-grid">
              {featured.map((wp: any) => (
                <Link key={wp._id} href={`/wallpapers/${wp._id}`} className="wg-item">
                  <img src={wp.thumbnailUrl} alt={wp.title} loading="lazy" />
                  <div className="wg-overlay">
                    <div className="wg-overlay-inner">
                      <span className="wg-title">{wp.title}</span>
                      {wp.isPremium && <span className="badge-premium">⭐ Premium</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Download CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.12) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Get the multiartai.app</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
              Set wallpapers directly from your phone. New wallpapers daily. 100% free, no ads.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                🤖 Google Play
              </a>
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                🍎 App Store
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
