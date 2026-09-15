<?php

namespace App\Controllers\MultiStocks;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class SettingsController
{
    public function show()
    {
        Session::requireAuth();

        $settings = ['has_gemini' => false, 'has_openai' => false, 'use_test_ads' => true, 'mobile_api_url' => ''];
        $logs = [];
        try {
            $client = Session::multiStocksClient();
            $settings = $client->get('/api/settings');
            $logs = $client->get('/api/admin/logs');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        View::render('multistocks/settings', [
            'settings' => $settings,
            'logs' => $logs,
            'module' => 'multistocks',
            'active' => 'settings',
        ]);
    }

    /** GET /admin/multistocks/settings/logs — polled every few seconds by the page's JS. */
    public function logs()
    {
        Session::requireAuth();
        $logs = [];
        try {
            $logs = Session::multiStocksClient()->get('/api/admin/logs');
        } catch (ApiException $e) {
            // Polling endpoint: fail quietly, the page keeps its last-known logs.
        }
        header('Content-Type: application/json');
        echo json_encode($logs);
        exit;
    }

    public function updateKeys()
    {
        Session::requireAuth();

        $payload = [];
        if (!empty($_POST['gemini_key'])) {
            $payload['gemini_key'] = $_POST['gemini_key'];
        }
        if (!empty($_POST['openai_key'])) {
            $payload['openai_key'] = $_POST['openai_key'];
        }

        try {
            Session::multiStocksClient()->post('/api/settings', $payload);
            Session::flash('success', 'API keys updated.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/settings');
        exit;
    }

    public function updateMobileUrl()
    {
        Session::requireAuth();

        try {
            Session::multiStocksClient()->post('/api/settings', [
                'mobile_api_url' => $_POST['mobile_api_url'] ?? '',
            ]);
            Session::flash('success', 'Mobile API URL updated.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/settings');
        exit;
    }

    public function updateAds()
    {
        Session::requireAuth();

        try {
            Session::multiStocksClient()->post('/api/settings', [
                'use_test_ads' => ($_POST['use_test_ads'] ?? 'true') === 'true',
            ]);
            Session::flash('success', 'Ad mode updated.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/settings');
        exit;
    }
}
