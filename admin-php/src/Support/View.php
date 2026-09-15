<?php

namespace App\Support;

class View
{
    private static string $viewsPath;

    public static function init(string $viewsPath): void
    {
        self::$viewsPath = rtrim($viewsPath, '/');
    }

    /** Renders a view inside the shared dashboard layout (sidebar + topbar + flash banner). */
    public static function render(string $view, array $data = []): never
    {
        $content = self::capture($view, $data);
        self::capture('layout', array_merge($data, [
            'content' => $content,
            'admin' => Session::admin(),
            'flash' => Session::consumeFlash(),
        ]), true);
        exit;
    }

    /** Renders a bare view with no layout (e.g. the login page). */
    public static function renderBare(string $view, array $data = []): never
    {
        self::capture($view, array_merge($data, ['flash' => Session::consumeFlash()]), true);
        exit;
    }

    private static function capture(string $view, array $data, bool $echo = false): string
    {
        extract($data, EXTR_SKIP);
        $path = self::$viewsPath . '/' . $view . '.php';
        if ($echo) {
            require $path;
            return '';
        }
        ob_start();
        require $path;
        return ob_get_clean();
    }

    public static function e(?string $value): string
    {
        return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
    }
}
