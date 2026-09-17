<?php

namespace App\Models;

use App\Database;
use App\Support\Dates;
use App\Support\Id;
use PDO;

class CategoryModel
{
    public static function findActive(): array
    {
        $stmt = Database::connection()->query(
            'SELECT * FROM categories WHERE is_active = 1 ORDER BY `order` ASC, name ASC'
        );
        return array_map([self::class, 'toJson'], $stmt->fetchAll());
    }

    public static function findBySlug(string $slug, bool $activeOnly = true): ?array
    {
        $sql = 'SELECT * FROM categories WHERE slug = ?' . ($activeOnly ? ' AND is_active = 1' : '');
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute([strtolower($slug)]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findById(string $id): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM categories WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /** @return array<string, array> keyed by category id */
    public static function findByIds(array $ids): array
    {
        $ids = array_values(array_unique(array_filter($ids)));
        if (empty($ids)) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = Database::connection()->prepare("SELECT * FROM categories WHERE id IN ({$placeholders})");
        $stmt->execute($ids);

        $byId = [];
        foreach ($stmt->fetchAll() as $row) {
            $byId[$row['id']] = $row;
        }
        return $byId;
    }

    public static function create(array $data): array
    {
        $id = Id::generate();
        $stmt = Database::connection()->prepare(
            'INSERT INTO categories (id, name, slug, icon, cover_image_url, description, event_date, `order`, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)'
        );
        $stmt->execute([
            $id,
            $data['name'],
            strtolower($data['slug']),
            $data['icon'] ?? '🖼️',
            $data['coverImageUrl'] ?? null,
            $data['description'] ?? null,
            $data['eventDate'] ?? null,
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
            'name' => 'name',
            'slug' => 'slug',
            'icon' => 'icon',
            'coverImageUrl' => 'cover_image_url',
            'description' => 'description',
            'eventDate' => 'event_date',
            'order' => '`order`',
            'isActive' => 'is_active',
            'wallpaperCount' => 'wallpaper_count',
        ];

        $sets = [];
        $params = [];
        foreach ($fieldMap as $jsonKey => $column) {
            if (array_key_exists($jsonKey, $data)) {
                $value = $data[$jsonKey];
                if ($jsonKey === 'slug' && $value !== null) {
                    $value = strtolower($value);
                }
                if ($jsonKey === 'isActive') {
                    $value = $value ? 1 : 0;
                }
                $sets[] = "{$column} = ?";
                $params[] = $value;
            }
        }

        if (empty($sets)) {
            return self::findById($id);
        }

        $params[] = $id;
        $sql = 'UPDATE categories SET ' . implode(', ', $sets) . ' WHERE id = ?';
        Database::connection()->prepare($sql)->execute($params);

        return self::findById($id);
    }

    public static function deactivate(string $id): void
    {
        $stmt = Database::connection()->prepare('UPDATE categories SET is_active = 0 WHERE id = ?');
        $stmt->execute([$id]);
    }

    public static function incrementWallpaperCount(string $id, int $delta): void
    {
        $stmt = Database::connection()->prepare(
            'UPDATE categories SET wallpaper_count = GREATEST(0, wallpaper_count + ?) WHERE id = ?'
        );
        $stmt->execute([$delta, $id]);
    }

    public static function findOrCreateBySlug(string $name, string $slug, array $extra = []): array
    {
        $existing = self::findBySlug($slug, false);
        if ($existing) {
            return $existing;
        }
        return self::create(array_merge(['name' => $name, 'slug' => $slug], $extra));
    }

    public static function toJson(array $category): array
    {
        return [
            '_id' => $category['id'],
            'name' => $category['name'],
            'slug' => $category['slug'],
            'icon' => $category['icon'],
            'coverImageUrl' => $category['cover_image_url'],
            'description' => $category['description'],
            'eventDate' => $category['event_date'],
            'order' => (int) $category['order'],
            'isActive' => (bool) $category['is_active'],
            'wallpaperCount' => (int) $category['wallpaper_count'],
            'createdAt' => Dates::iso($category['created_at']),
            'updatedAt' => Dates::iso($category['updated_at']),
        ];
    }

    /** Slim projection used when a wallpaper's category is "populated". */
    public static function toRefJson(array $category, array $fields = ['name', 'slug', 'icon']): array
    {
        $full = self::toJson($category);
        $out = ['_id' => $full['_id']];
        foreach ($fields as $field) {
            $out[$field] = $full[$field];
        }
        return $out;
    }
}
