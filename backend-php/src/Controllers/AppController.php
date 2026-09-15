<?php

namespace App\Controllers;

use App\Auth;
use App\Models\AppModel;
use App\Support\Request;
use App\Support\Response;

class AppController
{
    /** GET /api/apps (admin) — the super-admin's app registry. */
    public function index()
    {
        Auth::requireAdmin();
        Response::json(AppModel::all());
    }

    /** POST /api/apps (super admin only) */
    public function create()
    {
        $admin = Auth::requireAdmin();
        $this->requireSuper($admin);

        $key = Request::input('key');
        $name = Request::input('name');
        if (!$key || !$name) {
            Response::error('key and name are required', 400);
        }

        if (AppModel::findByKey($key)) {
            Response::error('An app with this key already exists', 409);
        }

        $app = AppModel::create([
            'key' => $key,
            'name' => $name,
            'description' => Request::input('description'),
            'icon' => Request::input('icon'),
            'status' => Request::input('status', 'coming_soon'),
            'adminModule' => Request::input('adminModule'),
            'apiBaseUrl' => Request::input('apiBaseUrl'),
            'order' => Request::input('order', 0),
        ]);

        Response::json(AppModel::toJson($app), 201);
    }

    /** PUT /api/apps/:id (super admin only) */
    public function update(string $id)
    {
        $admin = Auth::requireAdmin();
        $this->requireSuper($admin);

        $app = AppModel::update($id, Request::all());
        if (!$app) {
            Response::error('App not found', 404);
        }
        Response::json(AppModel::toJson($app));
    }

    /** DELETE /api/apps/:id (super admin only) */
    public function destroy(string $id)
    {
        $admin = Auth::requireAdmin();
        $this->requireSuper($admin);

        AppModel::delete($id);
        Response::json(['message' => 'App removed']);
    }

    private function requireSuper(array $admin): void
    {
        if (($admin['role'] ?? null) !== 'super') {
            Response::error('Forbidden: super admin only', 403);
        }
    }
}
