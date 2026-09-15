<?php

namespace App\Controllers\Wallpapers;

use App\Support\Session;
use App\Support\View;

class DashboardController
{
    public function index()
    {
        Session::requireAuth();
        $client = Session::client();

        $stats = $client->get('/api/wallpapers/admin/stats');
        $categories = $client->get('/api/categories');

        View::render('wallpapers/dashboard', [
            'stats' => $stats,
            'categoryCount' => count($categories),
            'module' => 'wallpapers',
            'active' => 'dashboard',
        ]);
    }
}
