<?php

namespace App\Controllers;

use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class HomeController
{
    /**
     * Maps an app's `admin_module` value to the built-in module's dashboard
     * route. Shared by show() below and by src/Views/apps/index.php (via
     * HomeController::moduleRoute()) so the two never drift out of sync.
     */
    private const MODULE_ROUTES = [
        'wallpapers' => '/admin/wallpapers/dashboard',
        'multistocks' => '/admin/multistocks/dashboard',
    ];

    public static function moduleRoute(?string $adminModule): ?string
    {
        return self::MODULE_ROUTES[$adminModule] ?? null;
    }

    /** GET / — the super-admin's app grid. */
    public function index()
    {
        Session::requireAuth();
        $apps = Session::client()->get('/api/apps');
        View::render('apps/index', ['apps' => $apps, 'module' => null, 'active' => null]);
    }

    /** GET /apps/:key — placeholder page for an app with no built-in admin module yet. */
    public function show(string $key)
    {
        Session::requireAuth();
        $apps = Session::client()->get('/api/apps');
        $app = null;
        foreach ($apps as $a) {
            if ($a['key'] === $key) {
                $app = $a;
                break;
            }
        }
        if (!$app) {
            Session::flash('error', 'Unknown app.');
            header('Location: /admin/');
            exit;
        }

        if ($route = self::moduleRoute($app['adminModule'])) {
            header('Location: ' . $route);
            exit;
        }

        View::render('apps/placeholder', ['app' => $app, 'module' => null, 'active' => null]);
    }

    /** POST /apps — register a new app entry (super admin only). */
    public function create()
    {
        Session::requireSuper();

        try {
            Session::client()->post('/api/apps', [
                'key' => $_POST['key'] ?? '',
                'name' => $_POST['name'] ?? '',
                'description' => $_POST['description'] ?? null,
                'icon' => $_POST['icon'] ?: '📱',
                'status' => $_POST['status'] ?? 'coming_soon',
                'order' => (int) ($_POST['order'] ?? 0),
            ]);
            Session::flash('success', 'App added.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/');
        exit;
    }

    /** POST /apps/:id/update (super admin only) */
    public function update(string $id)
    {
        Session::requireSuper();

        try {
            Session::client()->put("/api/apps/{$id}", [
                'name' => $_POST['name'] ?? '',
                'description' => $_POST['description'] ?? null,
                'icon' => $_POST['icon'] ?: '📱',
                'status' => $_POST['status'] ?? 'coming_soon',
                'apiBaseUrl' => $_POST['apiBaseUrl'] ?: null,
                'order' => (int) ($_POST['order'] ?? 0),
            ]);
            Session::flash('success', 'App updated.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/');
        exit;
    }

    /** POST /apps/:id/delete (super admin only) */
    public function destroy(string $id)
    {
        Session::requireSuper();

        try {
            Session::client()->delete("/api/apps/{$id}");
            Session::flash('success', 'App removed.');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
        }

        header('Location: /admin/');
        exit;
    }
}
