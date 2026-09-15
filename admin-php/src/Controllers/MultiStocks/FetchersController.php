<?php

namespace App\Controllers\MultiStocks;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class FetchersController
{
    public function show()
    {
        Session::requireAuth();

        $markets = [];
        try {
            $markets = Session::multiStocksClient()->get('/api/admin/markets');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        $selected = $_GET['market'] ?? array_key_first($markets);

        View::render('multistocks/fetchers', [
            'markets' => $markets,
            'selected' => $selected,
            'module' => 'multistocks',
            'active' => 'fetchers',
        ]);
    }

    public function trigger()
    {
        Session::requireAuth();
        $market = $_POST['market'] ?? 'PK';

        try {
            Session::multiStocksClient()->post('/api/admin/fetcher/trigger?market=' . urlencode($market));
            Session::flash('success', "Data refresh completed for market $market.");
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/fetchers?market=' . urlencode($market));
        exit;
    }

    /** Saves edited text fields (subtitle/currency/defaultTicker/welcome) for one market. */
    public function save()
    {
        Session::requireAuth();
        $market = $_POST['market'] ?? '';

        try {
            $client = Session::multiStocksClient();
            $markets = $client->get('/api/admin/markets');
            if (!isset($markets[$market])) {
                Session::flash('error', 'Unknown market.');
                header('Location: /admin/multistocks/fetchers');
                exit;
            }

            $markets[$market]['subtitle'] = $_POST['subtitle'] ?? $markets[$market]['subtitle'];
            $markets[$market]['currency'] = $_POST['currency'] ?? $markets[$market]['currency'];
            $markets[$market]['defaultTicker'] = $_POST['defaultTicker'] ?? $markets[$market]['defaultTicker'];
            $markets[$market]['welcome'] = $_POST['welcome'] ?? $markets[$market]['welcome'];

            $client->post('/api/admin/markets', $markets);
            Session::flash('success', 'Market configuration saved.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/fetchers?market=' . urlencode($market));
        exit;
    }

    public function addTicker()
    {
        Session::requireAuth();
        $market = $_POST['market'] ?? '';
        $ticker = strtoupper(trim($_POST['ticker'] ?? ''));

        if ($market && $ticker) {
            try {
                $client = Session::multiStocksClient();
                $markets = $client->get('/api/admin/markets');
                if (isset($markets[$market]) && !in_array($ticker, $markets[$market]['watchlist'] ?? [], true)) {
                    $markets[$market]['watchlist'][] = $ticker;
                    $client->post('/api/admin/markets', $markets);
                }
            } catch (ApiException $e) {
                Session::flash('error', $e->getMessage());
            }
        }

        header('Location: /admin/multistocks/fetchers?market=' . urlencode($market));
        exit;
    }

    public function removeTicker()
    {
        Session::requireAuth();
        $market = $_POST['market'] ?? '';
        $ticker = $_POST['ticker'] ?? '';

        if ($market && $ticker) {
            try {
                $client = Session::multiStocksClient();
                $markets = $client->get('/api/admin/markets');
                if (isset($markets[$market])) {
                    $markets[$market]['watchlist'] = array_values(array_filter(
                        $markets[$market]['watchlist'] ?? [],
                        fn($t) => $t !== $ticker
                    ));
                    $client->post('/api/admin/markets', $markets);
                }
            } catch (ApiException $e) {
                Session::flash('error', $e->getMessage());
            }
        }

        header('Location: /admin/multistocks/fetchers?market=' . urlencode($market));
        exit;
    }

    /** Adds a new country/market, matching the old admin's handleAddCountry exactly. */
    public function addMarket()
    {
        Session::requireAuth();
        $code = strtoupper(trim($_POST['code'] ?? ''));
        $name = trim($_POST['name'] ?? '');

        if (!$code || !$name) {
            Session::flash('error', 'Country code and name are required.');
            header('Location: /admin/multistocks/fetchers');
            exit;
        }

        try {
            $client = Session::multiStocksClient();
            $markets = $client->get('/api/admin/markets');

            if (isset($markets[$code])) {
                Session::flash('error', "Country code $code already exists.");
                header('Location: /admin/multistocks/fetchers');
                exit;
            }

            $defaultTicker = strtoupper(trim($_POST['defaultTicker'] ?? ''));
            $markets[$code] = [
                'name' => $name,
                'flag' => trim($_POST['flag'] ?? '') ?: '🌍',
                'title' => 'MultiStocks AI',
                'subtitle' => "$name Stock Exchange",
                'currency' => trim($_POST['currency'] ?? '') ?: '$',
                'defaultTicker' => $defaultTicker ?: 'TICKER',
                'watchlist' => $defaultTicker ? [$defaultTicker] : [],
                'welcome' => "Hello! I am your $name AI Advisor.",
                'suggestions' => [
                    [
                        'label' => 'Analyze ' . ($defaultTicker ?: 'Market'),
                        'query' => 'Can you analyze ' . ($defaultTicker ?: 'this market') . '?',
                    ],
                ],
            ];

            $client->post('/api/admin/markets', $markets);
            Session::flash('success', "$name added.");
            header('Location: /admin/multistocks/fetchers?market=' . urlencode($code));
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
            header('Location: /admin/multistocks/fetchers');
        }
        exit;
    }

    /** Deletes a market. Blocked if it's the only one left, matching the old admin. */
    public function deleteMarket()
    {
        Session::requireAuth();
        $market = $_POST['market'] ?? '';

        try {
            $client = Session::multiStocksClient();
            $markets = $client->get('/api/admin/markets');

            if (count($markets) <= 1) {
                Session::flash('error', 'At least one country configuration must remain active.');
                header('Location: /admin/multistocks/fetchers?market=' . urlencode($market));
                exit;
            }

            unset($markets[$market]);
            $client->post('/api/admin/markets', $markets);
            Session::flash('success', 'Country removed.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/fetchers');
        exit;
    }
}
