<?php

namespace App\Controllers\Wallpapers;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class AiQueueController
{
    public function index()
    {
        Session::requireAuth();
        $status = in_array($_GET['status'] ?? 'pending', ['pending', 'approved', 'rejected'], true)
            ? $_GET['status'] : 'pending';

        $wallpapers = Session::client()->get('/api/wallpapers/admin/ai-queue', ['status' => $status]);

        View::render('wallpapers/ai_queue', [
            'wallpapers' => $wallpapers,
            'status' => $status,
            'module' => 'wallpapers',
            'active' => 'ai-queue',
        ]);
    }

    public function approve(string $id)
    {
        Session::requireAuth();
        $feature = ($_POST['feature'] ?? '') === '1';

        try {
            Session::client()->post("/api/wallpapers/{$id}/approve");
            if ($feature) {
                Session::client()->put("/api/wallpapers/{$id}", ['isFeatured' => true]);
            }
            Session::flash('success', $feature ? 'Approved and featured.' : 'Approved.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    public function reject(string $id)
    {
        Session::requireAuth();

        try {
            Session::client()->post("/api/wallpapers/{$id}/reject");
            Session::flash('success', 'Rejected.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    public function delete(string $id)
    {
        Session::requireAuth();

        try {
            Session::client()->delete("/api/wallpapers/{$id}");
            Session::flash('success', 'Deleted.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    /** Deletes every currently-listed rejected wallpaper. */
    public function clearRejected()
    {
        Session::requireAuth();

        try {
            $rejected = Session::client()->get('/api/wallpapers/admin/ai-queue', ['status' => 'rejected']);
            $ids = array_column($rejected, '_id');
            if ($ids) {
                Session::client()->post('/api/wallpapers/bulk-delete', ['ids' => $ids]);
            }
            Session::flash('success', count($ids) . ' rejected wallpaper(s) cleared.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /wallpapers/ai-queue?status=rejected');
        exit;
    }

    private function back()
    {
        $status = $_POST['status'] ?? 'pending';
        header('Location: /wallpapers/ai-queue?status=' . urlencode($status));
        exit;
    }
}
