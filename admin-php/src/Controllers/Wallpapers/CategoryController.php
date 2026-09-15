<?php

namespace App\Controllers\Wallpapers;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class CategoryController
{
    public function index()
    {
        Session::requireAuth();
        $categories = Session::client()->get('/api/categories');
        View::render('wallpapers/categories', [
            'categories' => $categories,
            'module' => 'wallpapers',
            'active' => 'categories',
        ]);
    }

    public function create()
    {
        Session::requireAuth();

        try {
            Session::client()->post('/api/categories', [
                'name' => $_POST['name'] ?? '',
                'slug' => $_POST['slug'] ?? '',
                'icon' => $_POST['icon'] ?: '🖼️',
                'description' => $_POST['description'] ?? null,
                'order' => (int) ($_POST['order'] ?? 0),
            ]);
            Session::flash('success', 'Category created.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /wallpapers/categories');
        exit;
    }

    public function destroy(string $id)
    {
        Session::requireAuth();

        try {
            Session::client()->delete("/api/categories/{$id}");
            Session::flash('success', 'Category deactivated.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /wallpapers/categories');
        exit;
    }
}
