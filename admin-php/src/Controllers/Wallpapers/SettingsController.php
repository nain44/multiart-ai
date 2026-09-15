<?php

namespace App\Controllers\Wallpapers;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class SettingsController
{
    private const FIELDS = [
        'featured_limit' => ['label' => 'Featured wallpapers shown', 'default' => 30, 'help' => 'How many wallpapers /api/wallpapers/featured returns (admin-pinned first, filled with top downloads).'],
        'ai_daily_quota' => ['label' => 'AI generations per device / day', 'default' => 50, 'help' => 'Anti-abuse cap on POST /api/ai/generate per device — not the app\'s free/premium quota, which is client-side.'],
        'default_page_size' => ['label' => 'Default page size', 'default' => 20, 'help' => 'Wallpapers per page when a client doesn\'t specify ?limit=.'],
        'explore_results_per_source' => ['label' => 'Explore results per source', 'default' => 10, 'help' => 'How many Pexels and how many Unsplash results /api/explore fetches per page (each, not combined).'],
    ];

    public function show()
    {
        Session::requireAuth();

        $settings = [];
        try {
            $settings = Session::client()->get('/api/settings');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        View::render('wallpapers/settings', [
            'fields' => self::FIELDS,
            'settings' => $settings,
            'module' => 'wallpapers',
            'active' => 'settings',
        ]);
    }

    public function update()
    {
        Session::requireAuth();

        $payload = [];
        foreach (array_keys(self::FIELDS) as $key) {
            if (isset($_POST[$key]) && $_POST[$key] !== '') {
                $payload[$key] = (int) $_POST[$key];
            }
        }

        try {
            Session::client()->put('/api/settings', $payload);
            Session::flash('success', 'Settings saved.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/wallpapers/settings');
        exit;
    }
}
