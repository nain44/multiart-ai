'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="section-title">Browse Categories</h1>
        <p className="section-sub">Find your perfect wallpaper in {categories.length || 'our'} categories</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {categories.map((cat: any) => (
          <Link key={cat._id} href={`/categories/${cat.slug}`} className="category-card">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{cat.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {cat.wallpaperCount} wallpapers
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <p>Categories are being set up. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
