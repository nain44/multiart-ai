import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const cat = await api.category(params.slug);
    return {
      title: `${cat.icon} ${cat.name} Wallpapers — Free Download | MultiArt AI`,
      description: `Browse ${cat.wallpaperCount}+ free ${cat.name} wallpapers in HD and 4K resolution. Download for Android and iPhone, no sign-up required.`,
      openGraph: {
        title: `${cat.name} Wallpapers | MultiArt AI`,
        description: cat.description || `Free ${cat.name} wallpapers`,
        type: 'website',
      },
    };
  } catch {
    return { title: 'Category | MultiArt AI' };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page) || 1;

  // 1. Resolve slug → category document (gets us the _id and metadata)
  let category: any;
  try {
    category = await api.category(params.slug);
  } catch {
    notFound();
  }

  // 2. Fetch wallpapers filtered by category ObjectId
  let wallpapers: any[] = [];
  let pagination: any = null;
  try {
    const data = await api.byCategoryId(category._id, page);
    wallpapers = data.wallpapers;
    pagination = data.pagination;
  } catch {
    wallpapers = [];
  }

  const prevHref = page > 1 ? `/categories/${params.slug}?page=${page - 1}` : null;
  const nextHref =
    pagination && page < pagination.pages
      ? `/categories/${params.slug}?page=${page + 1}`
      : null;

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px',
        }}
      >
        <Link
          href="/"
          className="text-link-hover"
        >
          Home
        </Link>
        <span>›</span>
        <Link
          href="/categories"
          className="text-link-hover"
        >
          Categories
        </Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{category.name}</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
          }}>
            {category.icon}
          </div>
          <div>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 30%, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
            }}>
              {category.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              {pagination
                ? `${pagination.total.toLocaleString()} wallpapers available`
                : category.description || `Free ${category.name} wallpapers in HD & 4K`}
            </p>
          </div>
        </div>

        {category.description && pagination && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '640px', lineHeight: 1.7 }}>
            {category.description}
          </p>
        )}

        {/* Quick nav chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          <Link href="/categories" className="chip" style={{ fontSize: '13px', padding: '6px 14px' }}>
            ← All Categories
          </Link>
          <Link href="/wallpapers" className="chip" style={{ fontSize: '13px', padding: '6px 14px' }}>
            🖼️ All Wallpapers
          </Link>
        </div>
      </div>

      {/* Grid */}
      {wallpapers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 40px' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>{category.icon}</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>No wallpapers yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
            This category is being filled up. Check back soon!
          </p>
          <Link href="/wallpapers" className="btn btn-primary">
            Browse All Wallpapers →
          </Link>
        </div>
      ) : (
        <>
          <div className="wg-grid">
            {wallpapers.map((wp: any) => (
              <Link key={wp._id} href={`/wallpapers/${wp._id}`} className="wg-item">
                <img src={wp.thumbnailUrl} alt={wp.title} loading="lazy" />
                <div className="wg-overlay">
                  <div className="wg-overlay-inner">
                    <span className="wg-title">{wp.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {wp.isPremium && <span className="badge-premium">⭐ Premium</span>}
                      <span style={{
                        fontSize: '10px', fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.6)',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '1px 6px', borderRadius: '4px',
                      }}>
                        {wp.resolution}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center',
              alignItems: 'center', gap: '12px',
              marginTop: '48px', flexWrap: 'wrap',
            }}>
              {prevHref ? (
                <Link href={prevHref} className="btn btn-outline" style={{ fontSize: '14px', padding: '10px 24px' }}>
                  ← Previous
                </Link>
              ) : (
                <button className="btn btn-outline" disabled style={{ fontSize: '14px', padding: '10px 24px', opacity: 0.4, cursor: 'not-allowed' }}>
                  ← Previous
                </button>
              )}

              <span style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '0 8px' }}>
                Page {page} of {pagination.pages}
              </span>

              {nextHref ? (
                <Link href={nextHref} className="btn btn-outline" style={{ fontSize: '14px', padding: '10px 24px' }}>
                  Next →
                </Link>
              ) : (
                <button className="btn btn-outline" disabled style={{ fontSize: '14px', padding: '10px 24px', opacity: 0.4, cursor: 'not-allowed' }}>
                  Next →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
