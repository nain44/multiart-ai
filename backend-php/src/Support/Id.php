<?php

namespace App\Support;

/**
 * Generates 24-char hex IDs shaped like MongoDB ObjectIds, so existing
 * clients (mobile app, admin dashboard) that treat `_id` as an opaque
 * 24-hex-char string keep working unchanged.
 */
class Id
{
    public static function generate(): string
    {
        $timestamp = dechex(time());
        $random = bin2hex(random_bytes(8));
        return str_pad($timestamp, 8, '0', STR_PAD_LEFT) . $random;
    }

    public static function isValid(?string $id): bool
    {
        return is_string($id) && preg_match('/^[a-f0-9]{24}$/i', $id) === 1;
    }
}
