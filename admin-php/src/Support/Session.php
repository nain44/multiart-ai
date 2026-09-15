<?php

namespace App\Support;

class Session
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function login(string $token, array $admin): void
    {
        $_SESSION['token'] = $token;
        $_SESSION['admin'] = $admin;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_destroy();
    }

    public static function token(): ?string
    {
        return $_SESSION['token'] ?? null;
    }

    public static function admin(): ?array
    {
        return $_SESSION['admin'] ?? null;
    }

    public static function isSuper(): bool
    {
        return (self::admin()['role'] ?? null) === 'super';
    }

    public static function client(): ApiClient
    {
        return new ApiClient(self::token());
    }

    /** Client for the separate MultiStocks AI backend (no auth of its own). */
    public static function multiStocksClient(): ApiClient
    {
        return new ApiClient(null, $_ENV['MULTISTOCKS_API_URL'] ?? 'https://bmultistocksai.paynovatechnologies.com');
    }

    /** Redirects to /login if not authenticated. Called at the top of protected pages. */
    public static function requireAuth(): void
    {
        if (!self::token()) {
            header('Location: /admin/login');
            exit;
        }
    }

    public static function requireSuper(): void
    {
        self::requireAuth();
        if (!self::isSuper()) {
            self::flash('error', 'Only a super admin can do that.');
            header('Location: /admin/');
            exit;
        }
    }

    public static function flash(string $type, string $message): void
    {
        $_SESSION['flash'] = ['type' => $type, 'message' => $message];
    }

    /** Reads and clears the one-time flash message. */
    public static function consumeFlash(): ?array
    {
        $flash = $_SESSION['flash'] ?? null;
        unset($_SESSION['flash']);
        return $flash;
    }
}
