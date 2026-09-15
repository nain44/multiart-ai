<?php

namespace App\Support;

class Response
{
    public static function json(mixed $data, int $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, int $status = 500, ?string $errorDetail = null)
    {
        $payload = ['message' => $message];
        if ($errorDetail !== null) {
            $payload['error'] = $errorDetail;
        }
        self::json($payload, $status);
    }
}
