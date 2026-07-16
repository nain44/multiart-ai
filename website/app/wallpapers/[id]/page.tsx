import { Metadata } from 'next';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const wp = await api.wallpaper(params.id);
    return {
      title: `${wp.title} — Free Download | MultiArt AI`,
      description: `Download free ${wp.resolution} wallpaper: ${wp.title}. Part of the ${wp.category?.name || 'MultiArt AI'} collection.`,
      openGraph: {
        title: wp.title,
        images: [wp.thumbnailUrl],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Wallpaper | MultiArt AI' };
  }
}

async function trackDownload(id: string) {
  'use server';
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallpapers/${id}/download`, { method: 'POST' });
  } catch {}
}

export default async function WallpaperDetailPage({ params }: Props) {
  let wp: any;
  try {
    wp = await api.wallpaper(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '900px' }}>
      <Link href="/wallpapers" className="text-link-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        ← Back to Wallpapers
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px', alignItems: 'start' }}>
        {/* Image */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--surface2)' }}>
          <img
            src={wp.imageUrl}
            alt={wp.title}
            style={{ width: '100%', display: 'block', borderRadius: '16px' }}
          />
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {wp.isPremium && <span className="badge-premium">⭐ Premium</span>}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{wp.resolution}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.3 }}>{wp.title}</h1>
            {wp.category && (
              <Link href={`/categories/${wp.category.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#a78bfa', fontSize: '13px' }}>
                📁 {wp.category.name}
              </Link>
            )}
            {wp.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px', lineHeight: 1.7 }}>{wp.description}</p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>📥 {wp.downloadCount?.toLocaleString() || 0} downloads</span>
          </div>

          {/* Tags */}
          {wp.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {wp.tags.map((tag: string) => (
                <span key={tag} style={{
                  padding: '4px 10px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '99px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Download Button */}
          <a
            href={wp.imageUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ justifyContent: 'center', padding: '14px' }}
            onClick={async () => {
              try { await fetch(`/api/track-download?id=${wp._id}`, { method: 'POST' }); } catch {}
            }}
          >
            📥 Download Free
          </a>

          {/* Attribution */}
          {wp.photographer && (
            <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
              📷 Photo by{' '}
              {wp.photographerUrl ? (
                <a href={wp.source === 'unsplash' ? (wp.photographerUrl.includes('?') ? `${wp.photographerUrl}&utm_source=multiartai&utm_medium=referral` : `${wp.photographerUrl}?utm_source=multiartai&utm_medium=referral`) : wp.photographerUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>{wp.photographer}</a>
              ) : wp.photographer} on {wp.source === 'pexels' ? (
                <a href="https://pexels.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>Pexels</a>
              ) : (
                <a href="https://unsplash.com/?utm_source=multiartai&utm_medium=referral" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>Unsplash</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
