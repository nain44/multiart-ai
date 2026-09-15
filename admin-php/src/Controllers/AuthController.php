<?php

namespace App\Controllers;

use App\Support\ApiClient;
use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;

class AuthController
{
    public function showLogin()
    {
        if (Session::token()) {
            header('Location: /');
            exit;
        }
        View::renderBare('login');
    }

    public function login()
    {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        try {
            $result = (new ApiClient())->post('/api/auth/login', ['email' => $email, 'password' => $password]);
            Session::login($result['token'], $result['admin']);
            header('Location: /');
        } catch (ApiException $e) {
            Session::flash('error', $e->getMessage());
            header('Location: /login');
        }
        exit;
    }

    public function logout()
    {
        Session::logout();
        header('Location: /login');
        exit;
    }
}
