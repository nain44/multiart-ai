<?php

namespace App\Controllers;

use App\Auth;
use App\Models\AdminModel;
use App\Support\Request;
use App\Support\Response;

class AuthController
{
    /** POST /api/auth/login — returns a JWT for valid admin credentials. */
    public function login()
    {
        $email = Request::input('email');
        $password = Request::input('password');

        if (!$email || !$password) {
            Response::error('Email and password are required', 400);
        }

        $admin = AdminModel::findByEmail($email);
        if (!$admin || !AdminModel::comparePassword($admin, $password)) {
            Response::error('Invalid email or password', 401);
        }

        $token = Auth::sign(['id' => $admin['id'], 'role' => $admin['role']], '+7 days');

        Response::json([
            'token' => $token,
            'admin' => [
                'id' => $admin['id'],
                'name' => $admin['name'],
                'email' => $admin['email'],
                'role' => $admin['role'],
            ],
        ]);
    }

    /** POST /api/auth/setup — one-time endpoint to create the first admin account. */
    public function setup()
    {
        if (AdminModel::count() > 0) {
            Response::error('Setup already completed. Use login instead.', 403);
        }

        $email = Request::input('email');
        $password = Request::input('password');
        $name = Request::input('name');

        if (!$email || !$password) {
            Response::error('Email and password are required', 400);
        }
        if (strlen($password) < 8) {
            Response::error('Password must be at least 8 characters', 400);
        }

        AdminModel::create($email, $password, $name ?: 'Admin');

        Response::json(['message' => '✅ Admin account created. You can now log in.'], 201);
    }

    /** GET /api/auth/me — returns current admin info (protected). */
    public function me()
    {
        $decoded = Auth::requireAdmin();
        $admin = AdminModel::findById($decoded['id']);
        if (!$admin) {
            Response::error('Admin not found', 404);
        }
        Response::json(AdminModel::toJson($admin));
    }
}
