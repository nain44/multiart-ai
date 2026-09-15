<?php

namespace App\Models;

use App\Database;

/**
 * Simple key/value app settings, editable from the admin without a code
 * change (e.g. featured_limit, ai_daily_quota).
 */
class SettingModel
{
    /** @return array<string, string> */
    public static function all(): array
    {
        $stmt = Database::connection()->query('SELECT `key`, value FROM settings');
        $out = [];
        foreach ($stmt->fetchAll() as $row) {
            $out[$row['key']] = $row['value'];
        }
        return $out;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $stmt = Database::connection()->prepare('SELECT value FROM settings WHERE `key` = ? LIMIT 1');
        $stmt->execute([$key]);
        $value = $stmt->fetchColumn();
        return $value !== false ? $value : $default;
    }

    public static function getInt(string $key, int $default): int
    {
        $value = self::get($key);
        return $value !== null && is_numeric($value) ? (int) $value : $default;
    }

    public static function set(string $key, string $value): void
    {
        $stmt = Database::connection()->prepare(
            'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)'
        );
        $stmt->execute([$key, $value]);
    }

    /** @param array<string, string> $values */
    public static function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            self::set($key, $value);
        }
    }
}
