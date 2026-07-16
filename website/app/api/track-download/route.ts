import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/track-download?id=<wallpaperId>
 *
 * Thin server-side proxy that forwards the download event
 * to the backend API. This avoids exposing the backend URL
 * in client-side code and keeps CORS config simple.
 */
export async function POST(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  try {
    await fetch(`${apiBase}/wallpapers/${id}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Fire-and-forget — don't block the download if tracking fails
  }

  return NextResponse.json({ success: true });
}
