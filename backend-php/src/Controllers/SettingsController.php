<?php

namespace App\Controllers;

use App\Auth;
use App\Models\SettingModel;
use App\Support\Request;
use App\Support\Response;

class SettingsController
{
    private const ALLOWED_KEYS = ['featured_limit', 'ai_daily_quota', 'default_page_size', 'explore_results_per_source'];

    /** GET /api/settings (admin) */
    public function index()
    {
        Auth::requireAdmin();
        Response::json(SettingModel::all());
    }

    /** PUT /api/settings (admin) — merges any of the allowed keys present in the body. */
    public function update()
    {
        Auth::requireAdmin();

        $body = Request::json();
        $updates = [];
        foreach (self::ALLOWED_KEYS as $key) {
            if (array_key_exists($key, $body) && $body[$key] !== null && $body[$key] !== '') {
                $updates[$key] = (string) $body[$key];
            }
        }

        if ($updates) {
            SettingModel::setMany($updates);
        }

        Response::json(SettingModel::all());
    }
}
