'use client';
import { useEffect, useState } from 'react';
import { wallpaperApi } from '../../../lib/api';

interface QueueItem {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  imageUrl: string;
  tags: string[];
  category: { name: string };
  createdAt: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

const TABS: { key: QueueItem['approvalStatus']; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AiQueuePage() {
  const [tab, setTab] = useState<QueueItem['approvalStatus']>('pending');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load(status: QueueItem['approvalStatus']) {
    setLoading(true);
    try {
      const data = await wallpaperApi.aiQueue(status);
      setItems(data);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await wallpaperApi.approve(id);
      setMsg({ type: 'success', text: 'Wallpaper approved and now public.' });
      load(tab);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      await wallpaperApi.reject(id);
      setMsg({ type: 'success', text: 'Wallpaper rejected.' });
      load(tab);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>AI Review Queue</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          User-submitted AI wallpapers requesting public listing.
        </p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No {tab} submissions.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <div key={item._id} className="table-wrap" style={{ padding: '12px' }}>
              <div style={{ width: '100%', aspectRatio: '9 / 16', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface2)', marginBottom: '10px' }}>
                <img src={item.thumbnailUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {item.category?.name || '—'} · {new Date(item.createdAt).toLocaleDateString()}
              </div>
              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    disabled={busyId === item._id}
                    onClick={() => handleApprove(item._id)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    disabled={busyId === item._id}
                    onClick={() => handleReject(item._id)}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
              {tab === 'rejected' && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  disabled={busyId === item._id}
                  onClick={() => handleApprove(item._id)}
                >
                  ✅ Approve anyway
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
