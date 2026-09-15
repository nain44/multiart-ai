<?php

namespace App;

use App\Support\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use UnexpectedValueException;

class Auth
{
    public static function sign(array $payload, string $expiresIn = '+7 days'): string
    {
        $now = time();
        $claims = array_merge($payload, [
            'iat' => $now,
            'exp' => strtotime($expiresIn, $now),
        ]);

        return JWT::encode($claims, $_ENV['JWT_SECRET'], 'HS256');
    }

    /**
     * Verifies the JWT Bearer token from the Authorization header.
     * Returns the decoded payload as an associative array, or halts the
     * request with a 401 JSON response.
     */
    public static function requireAdmin(): array
    {
        $header = self::authorizationHeader();

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            Response::error('Unauthorized: No token provided', 401);
        }

        $token = trim(substr($header, 7));

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            return (array) $decoded;
        } catch (ExpiredException|UnexpectedValueException $e) {
            Response::error('Unauthorized: Token invalid or expired', 401);
        }
    }

    private static function authorizationHeader(): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                return $value;
            }
        }
        return $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    }
}
