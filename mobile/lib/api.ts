import { API_BASE_URL, PAGE_SIZE } from '@/constants/Config';

export interface Wallpaper {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  isPremium: boolean;
  resolution: string;
  downloadCount: number;
  tags: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
    icon: string;
  };
  photographer?: string;
  photographerUrl?: string;
  source: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  wallpaperCount: number;
  isActive: boolean;
  order: number;
}

export interface PaginatedResponse {
  wallpapers: Wallpaper[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ExploreResponse {
  wallpapers: Wallpaper[];
  pagination: {
    page: number;
    hasMore: boolean;
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Wallpapers ─────────────────────────────────────────────────────────────
  wallpapers: (params: Record<string, string | number> = {}): Promise<PaginatedResponse> => {
    const qs = '?' + new URLSearchParams(params as any).toString();
    return apiFetch(`/wallpapers${qs}`);
  },

  featured: (): Promise<Wallpaper[]> => apiFetch('/wallpapers/featured'),

  random: (): Promise<Wallpaper> => apiFetch('/wallpapers/random'),

  wallpaper: (id: string): Promise<Wallpaper> => apiFetch(`/wallpapers/${id}`),

  search: (q: string, page = 1): Promise<PaginatedResponse> =>
    apiFetch(`/wallpapers?search=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`),

  byCategory: (categoryId: string, page = 1): Promise<PaginatedResponse> =>
    apiFetch(`/wallpapers?category=${categoryId}&page=${page}&limit=${PAGE_SIZE}`),

  trackDownload: (id: string): Promise<void> =>
    apiFetch(`/wallpapers/${id}/download`, { method: 'POST' }),

  // ── Live Explore (Pexels + Unsplash proxy) ─────────────────────────────────
  explore: (query = 'beautiful wallpaper', page = 1): Promise<ExploreResponse> =>
    apiFetch(`/explore?query=${encodeURIComponent(query)}&page=${page}`),

  // ── Categories ─────────────────────────────────────────────────────────────
  categories: (): Promise<Category[]> => apiFetch('/categories'),

  category: (slug: string): Promise<Category> => apiFetch(`/categories/${slug}`),

  // ── AI Generation ──────────────────────────────────────────────────────────
  generateAI: (prompt: string): Promise<Wallpaper> =>
    apiFetch('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  // ── Reporting ──────────────────────────────────────────────────────────────
  reportWallpaper: (id: string): Promise<{ success: boolean }> =>
    apiFetch(`/wallpapers/${id}/report`, { method: 'POST' }),
};
