<?php

namespace App\Support;

class Request
{
    private static ?array $jsonBody = null;
    private static bool $jsonParsed = false;

    /** Parsed JSON body (POST/PUT with Content-Type: application/json), or []. */
    public static function json(): array
    {
        if (!self::$jsonParsed) {
            self::$jsonParsed = true;
            $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
            if (str_contains($contentType, 'application/json')) {
                $raw = file_get_contents('php://input');
                $decoded = $raw ? json_decode($raw, true) : null;
                self::$jsonBody = is_array($decoded) ? $decoded : [];
            } else {
                self::$jsonBody = [];
            }
        }
        return self::$jsonBody;
    }

    /** Body value: checks parsed JSON first, falls back to $_POST (multipart/form-urlencoded). */
    public static function input(string $key, mixed $default = null): mixed
    {
        $json = self::json();
        if (array_key_exists($key, $json)) {
            return $json[$key];
        }
        return $_POST[$key] ?? $default;
    }

    public static function all(): array
    {
        return array_merge($_POST, self::json());
    }

    public static function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public static function header(string $name): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        foreach ($headers as $headerName => $value) {
            if (strcasecmp($headerName, $name) === 0) {
                return $value;
            }
        }
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$serverKey] ?? null;
    }

    public static function file(string $key): ?array
    {
        return $_FILES[$key] ?? null;
    }
}
