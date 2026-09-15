<?php

namespace App\Controllers\Wallpapers;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class UploadController
{
    public function show()
    {
        Session::requireAuth();
        $categories = Session::client()->get('/api/categories');
        View::render('wallpapers/upload', [
            'categories' => $categories,
            'module' => 'wallpapers',
            'active' => 'upload',
        ]);
    }

    public function store()
    {
        Session::requireAuth();

        $file = $_FILES['image'] ?? null;
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            Session::flash('error', 'Please choose an image file.');
            header('Location: /wallpapers/upload');
            exit;
        }
        if (empty($_POST['category'])) {
            Session::flash('error', 'Please choose a category.');
            header('Location: /wallpapers/upload');
            exit;
        }

        $fields = [
            'title' => $_POST['title'] ?? '',
            'description' => $_POST['description'] ?? '',
            'category' => $_POST['category'],
            'resolution' => $_POST['resolution'] ?? 'FHD',
            'tags' => $_POST['tags'] ?? '',
            'source' => $_POST['source'] ?? 'own',
            'photographer' => $_POST['photographer'] ?? '',
            'photographerUrl' => $_POST['photographerUrl'] ?? '',
            'isPremium' => $_POST['isPremium'] ?? 'false',
            'image' => new \CURLFile($file['tmp_name'], $file['type'], $file['name']),
        ];

        try {
            Session::client()->postMultipart('/api/wallpapers', $fields);
            Session::flash('success', 'Wallpaper uploaded.');
            header('Location: /wallpapers');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
            header('Location: /wallpapers/upload');
        }
        exit;
    }
}
