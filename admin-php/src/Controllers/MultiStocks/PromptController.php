<?php

namespace App\Controllers\MultiStocks;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class PromptController
{
    public function show()
    {
        Session::requireAuth();

        $prompts = ['portfolio_prompt' => '', 'chat_prompt' => ''];
        try {
            $prompts = Session::multiStocksClient()->get('/api/admin/prompt');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        View::render('multistocks/prompts', [
            'prompts' => $prompts,
            'module' => 'multistocks',
            'active' => 'prompts',
        ]);
    }

    public function update()
    {
        Session::requireAuth();

        try {
            Session::multiStocksClient()->post('/api/admin/prompt', [
                'portfolio_prompt' => $_POST['portfolio_prompt'] ?? '',
                'chat_prompt' => $_POST['chat_prompt'] ?? '',
            ]);
            Session::flash('success', 'Prompts updated successfully.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/multistocks/prompts');
        exit;
    }
}
