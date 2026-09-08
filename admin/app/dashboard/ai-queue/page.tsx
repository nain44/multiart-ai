'use client';
import { useEffect, useState } from 'react';
import { wallpaperApi } from '../../../lib/api';
import ConfirmDialog from '../../../components/ConfirmDialog';

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
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

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

  async function handleApproveAndFeature(id: string) {
    setBusyId(id);
    try {
      await wallpaperApi.approve(id);
      await wallpaperApi.update(id, { isFeatured: true, featuredAt: new Date().toISOString() });
      setMsg({ type: 'success', text: 'Wallpaper approved, public, and pinned to featured picks.' });
      load(tab);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setBusyId(id);
    try {
      await wallpaperApi.delete(id);
      setMsg({ type: 'success', text: 'Wallpaper permanently deleted.' });
      load(tab);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  }

  function handleClearRejected() {
    if (items.length === 0) return;
    setConfirmClearAll(true);
  }

  async function confirmClearRejected() {
    setClearing(true);
    try {
      await wallpaperApi.bulkDelete(items.map((item) => item._id));
      setMsg({ type: 'success', text: 'All rejected wallpapers permanently deleted.' });
      load(tab);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setClearing(false);
      setConfirmClearAll(false);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      await wallpaperApi.reject(id);
      setMsg({
        type: 'success',
        text: tab === 'approved' ? 'Approval revoked; wallpaper is no longer public.' : 'Wallpaper rejected.',
      });
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        {tab === 'rejected' && items.length > 0 && (
          <button
            className="btn btn-danger btn-sm"
            style={{ marginLeft: 'auto' }}
            disabled={clearing}
            onClick={handleClearRejected}
          >
            {clearing ? 'Clearing…' : `🗑️ Clear all (${items.length})`}
          </button>
        )}
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
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  <button
                    className="btn btn-sm"
                    style={{ flex: '1 1 100%' }}
                    disabled={busyId === item._id}
                    onClick={() => handleApproveAndFeature(item._id)}
                  >
                    📌 Approve & Feature
                  </button>
                </div>
              )}
              {tab === 'rejected' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    disabled={busyId === item._id || clearing}
                    onClick={() => handleApprove(item._id)}
                  >
                    ✅ Approve anyway
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    disabled={busyId === item._id || clearing}
                    onClick={() => handleDelete(item._id)}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ flex: '1 1 100%' }}
                    disabled={busyId === item._id || clearing}
                    onClick={() => handleApproveAndFeature(item._id)}
                  >
                    📌 Approve & Feature
                  </button>
                </div>
              )}
              {tab === 'approved' && (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                  disabled={busyId === item._id}
                  onClick={() => handleReject(item._id)}
                >
                  ↩️ Revoke approval
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete wallpaper?"
        message="Permanently delete this wallpaper and its image? This cannot be undone."
        confirmLabel="Delete"
        busy={!!busyId}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear all rejected?"
        message={`Permanently delete all ${items.length} rejected wallpaper(s)? This cannot be undone.`}
        confirmLabel="Delete All"
        busy={clearing}
        onConfirm={confirmClearRejected}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
}
