<?php

namespace App\Models;

use App\Database;
use App\Support\Dates;
use App\Support\Id;

/**
 * Registry of every product the super-admin panel manages. `wallpapers` (this
 * backend) is a built-in module; future apps register here with their own
 * `api_base_url` before the admin has real integration code for them.
 */
class AppModel
{
    public static function all(): array
    {
        $stmt = Database::connection()->query('SELECT * FROM apps ORDER BY `order` ASC, name ASC');
        return array_map([self::class, 'toJson'], $stmt->fetchAll());
    }

    public static function findById(string $id): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM apps WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByKey(string $key): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM apps WHERE `key` = ? LIMIT 1');
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(array $data): array
    {
        $id = Id::generate();
        $stmt = Database::connection()->prepare(
            'INSERT INTO apps (id, `key`, name, description, icon, status, admin_module, api_base_url, `order`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $data['key'],
            $data['name'],
            $data['description'] ?? null,
            $data['icon'] ?? '📱',
            $data['status'] ?? 'coming_soon',
            $data['adminModule'] ?? null,
            $data['apiBaseUrl'] ?? null,
            $data['order'] ?? 0,
        ]);
        return self::findById($id);
    }

    public static function update(string $id, array $data): ?array
    {
        $existing = self::findById($id);
        if (!$existing) {
            return null;
        }

        $fieldMap = [
            'key' => '`key`',
            'name' => 'name',
            'description' => 'description',
            'icon' => 'icon',
            'status' => 'status',
            'adminModule' => 'admin_module',
            'apiBaseUrl' => 'api_base_url',
            'order' => '`order`',
        ];

        $sets = [];
        $params = [];
        foreach ($fieldMap as $jsonKey => $column) {
            if (array_key_exists($jsonKey, $data)) {
                $sets[] = "{$column} = ?";
                $params[] = $data[$jsonKey];
            }
        }

        if (empty($sets)) {
            return $existing;
        }

        $params[] = $id;
        Database::connection()
            ->prepare('UPDATE apps SET ' . implode(', ', $sets) . ' WHERE id = ?')
            ->execute($params);

        return self::findById($id);
    }

    public static function delete(string $id): void
    {
        Database::connection()->prepare('DELETE FROM apps WHERE id = ?')->execute([$id]);
    }

    public static function toJson(array $app): array
    {
        return [
            '_id' => $app['id'],
            'key' => $app['key'],
            'name' => $app['name'],
            'description' => $app['description'],
            'icon' => $app['icon'],
            'status' => $app['status'],
            'adminModule' => $app['admin_module'],
            'apiBaseUrl' => $app['api_base_url'],
            'order' => (int) $app['order'],
            'createdAt' => Dates::iso($app['created_at']),
            'updatedAt' => Dates::iso($app['updated_at']),
        ];
    }
}
