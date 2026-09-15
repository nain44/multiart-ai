<?php

namespace App\Controllers\MultiStocks;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class DashboardController
{
    public function index()
    {
        Session::requireAuth();
        $client = Session::multiStocksClient();

        $config = ['markets' => []];
        $settings = ['has_gemini' => false, 'has_openai' => false, 'use_test_ads' => true, 'mobile_api_url' => ''];
        $error = null;

        try {
            $config = $client->get('/api/config');
            $settings = $client->get('/api/settings');
        } catch (ApiException $e) {
            $error = $e->getMessage();
        }

        $markets = $config['markets'] ?? [];
        $tickerCount = 0;
        foreach ($markets as $m) {
            $tickerCount += count($m['watchlist'] ?? []);
        }

        View::render('multistocks/dashboard', [
            'markets' => $markets,
            'settings' => $settings,
            'marketCount' => count($markets),
            'tickerCount' => $tickerCount,
            'error' => $error,
            'module' => 'multistocks',
            'active' => 'dashboard',
        ]);
    }
}
