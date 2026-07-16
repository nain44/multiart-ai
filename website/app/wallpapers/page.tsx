'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

interface Wallpaper {
  _id: string;
  title: string;
  thumbnailUrl: string;
  isPremium: boolean;
  resolution: string;
  category: { name: string };
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

export default function WallpapersPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const data = await api.wallpapers({ page: p, limit: 24, ...(q && { search: q }) });
      setWallpapers(data.wallpapers);
      setPagination(data.pagination);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, ''); }, [load]);

  function doSearch() {
    setSearch(inputVal);
    load(1, inputVal);
  }

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 className="section-title">All Wallpapers</h1>
        <p className="section-sub">
          {pagination ? `${pagination.total.toLocaleString()} wallpapers available` : 'Explore the collection'}
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', maxWidth: '480px' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Search wallpapers..."
          style={{
            flex: 1, padding: '12px 16px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '99px',
            color: 'var(--text)',
            fontSize: '14px',
          }}
        />
        <button onClick={doSearch} className="btn btn-primary" style={{ padding: '12px 20px', fontSize: '14px' }}>
          Search
        </button>
        {search && (
          <button onClick={() => { setInputVal(''); setSearch(''); load(1, ''); }} className="btn btn-outline" style={{ padding: '12px 20px', fontSize: '14px' }}>
            ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="wg-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton wg-item" style={{ height: `${200 + (i % 3) * 80}px`, marginBottom: '16px' }} />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
          <p>No wallpapers found. Try a different search.</p>
        </div>
      ) : (
        <div className="wg-grid">
          {wallpapers.map(wp => (
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
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '10px 20px', fontSize: '14px' }}
            disabled={page === 1}
            onClick={() => load(page - 1, search)}
          >← Previous</button>
          <span style={{ padding: '10px 20px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            className="btn btn-outline"
            style={{ padding: '10px 20px', fontSize: '14px' }}
            disabled={page === pagination.pages}
            onClick={() => load(page + 1, search)}
          >Next →</button>
        </div>
      )}
    </div>
  );
}
