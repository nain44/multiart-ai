<?php

namespace App\Controllers\Wallpapers;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class WallpaperController
{
    private const PAGE_SIZE = 15;

    public function index()
    {
        Session::requireAuth();

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $search = trim($_GET['search'] ?? '');
        $featuredOnly = ($_GET['featured'] ?? '') === '1';

        $query = ['page' => $page, 'limit' => self::PAGE_SIZE];
        if ($search !== '') {
            $query['search'] = $search;
        }
        if ($featuredOnly) {
            $query['isFeatured'] = 'true';
        }

        $result = Session::client()->get('/api/wallpapers', $query);

        View::render('wallpapers/list', [
            'wallpapers' => $result['wallpapers'] ?? [],
            'pagination' => $result['pagination'] ?? ['page' => 1, 'pages' => 1, 'total' => 0],
            'search' => $search,
            'featuredOnly' => $featuredOnly,
            'module' => 'wallpapers',
            'active' => 'wallpapers',
        ]);
    }

    public function togglePremium(string $id)
    {
        Session::requireAuth();
        $isPremium = ($_POST['isPremium'] ?? 'false') === 'true';

        try {
            Session::client()->put("/api/wallpapers/{$id}", ['isPremium' => $isPremium]);
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    public function toggleFeatured(string $id)
    {
        Session::requireAuth();
        $isFeatured = ($_POST['isFeatured'] ?? 'false') === 'true';

        try {
            Session::client()->put("/api/wallpapers/{$id}", ['isFeatured' => $isFeatured]);
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    public function destroy(string $id)
    {
        Session::requireAuth();

        try {
            Session::client()->delete("/api/wallpapers/{$id}");
            Session::flash('success', 'Wallpaper deleted.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    public function bulkDelete()
    {
        Session::requireAuth();

        $ids = json_decode($_POST['ids'] ?? '[]', true);
        if (!is_array($ids) || empty($ids)) {
            Session::flash('error', 'No wallpapers selected.');
            $this->back();
        }

        try {
            $result = Session::client()->post('/api/wallpapers/bulk-delete', ['ids' => $ids]);
            Session::flash('success', ($result['deletedCount'] ?? count($ids)) . ' wallpaper(s) deleted.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $this->back();
    }

    private function back()
    {
        $ref = isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER']) : null;
        $target = $ref['path'] ?? '/admin/wallpapers';
        if (!empty($ref['query'])) {
            $target .= '?' . $ref['query'];
        }
        header('Location: ' . $target);
        exit;
    }
}
