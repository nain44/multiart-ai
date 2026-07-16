const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  wallpapers: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiFetch(`/wallpapers${qs}`);
  },
  wallpaper: (id: string) => apiFetch(`/wallpapers/${id}`),
  featured: () => apiFetch('/wallpapers/featured'),
  categories: () => apiFetch('/categories'),
  /** Fetch single category by slug (uses GET /api/categories/:slug) */
  category: (slug: string) => apiFetch(`/categories/${slug}`),
  /**
   * Fetch wallpapers filtered by category ObjectId.
   * The backend GET /api/wallpapers accepts ?category=<ObjectId>
   */
  byCategoryId: (categoryId: string, page = 1) =>
    apiFetch(`/wallpapers?category=${categoryId}&page=${page}&limit=24`),
  /** @deprecated use byCategoryId — kept for legacy callers */
  byCategory: (categoryId: string, page = 1) =>
    apiFetch(`/wallpapers?category=${categoryId}&page=${page}&limit=24`),
  search: (q: string, page = 1) =>
    apiFetch(`/wallpapers?search=${encodeURIComponent(q)}&page=${page}&limit=24`),
};
