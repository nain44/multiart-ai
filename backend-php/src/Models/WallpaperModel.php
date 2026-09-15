<?php

namespace App\Models;

use App\Database;
use App\Support\Dates;
use App\Support\Id;
use PDO;

class WallpaperModel
{
    /** Strips dynamic query params so the same underlying image maps to one dedup key. */
    public static function normalizeImageUrl(?string $url): string
    {
        if (!$url) {
            return '';
        }
        $normalized = strtolower(trim($url));
        return preg_replace('/[?&](width|height|seed|fit|crop|nologo)=[^&]*/i', '', $normalized);
    }

    public static function dedupeKey(string $source, ?string $imageUrl): ?string
    {
        $base = self::normalizeImageUrl($imageUrl);
        return $base ? "{$source}|{$base}" : null;
    }

    public static function findById(string $id): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM wallpapers WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByImageUrl(string $imageUrl): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM wallpapers WHERE image_url = ? LIMIT 1');
        $stmt->execute([$imageUrl]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * @param array $filters isActive, visibility, approvalStatus, category, isPremium, isFeatured, search
     * @param array $options page, limit, sort
     */
    public static function paginate(array $filters, array $options): array
    {
        [$where, $params] = self::buildWhere($filters);

        $sortMap = [
            'popular' => 'download_count DESC',
            'newest' => 'created_at DESC',
            'createdAt' => 'created_at DESC',
        ];
        $orderBy = $sortMap[$options['sort'] ?? ''] ?? 'created_at DESC';

        $limit = max(1, (int) ($options['limit'] ?? 20));
        $page = max(1, (int) ($options['page'] ?? 1));
        $offset = ($page - 1) * $limit;

        $db = Database::connection();

        $countStmt = $db->prepare("SELECT COUNT(*) FROM wallpapers {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = "SELECT * FROM wallpapers {$where} ORDER BY {$orderBy} LIMIT {$limit} OFFSET {$offset}";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        return [
            'rows' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ];
    }

    private static function buildWhere(array $filters): array
    {
        $clauses = [];
        $params = [];

        if (array_key_exists('isActive', $filters)) {
            $clauses[] = 'is_active = ?';
            $params[] = $filters['isActive'] ? 1 : 0;
        }
        if (array_key_exists('visibility', $filters)) {
            $clauses[] = 'visibility = ?';
            $params[] = $filters['visibility'];
        }
        if (array_key_exists('approvalStatus', $filters)) {
            $clauses[] = 'approval_status = ?';
            $params[] = $filters['approvalStatus'];
        }
        if (!empty($filters['category'])) {
            $clauses[] = 'category_id = ?';
            $params[] = $filters['category'];
        }
        if (array_key_exists('isPremium', $filters)) {
            $clauses[] = 'is_premium = ?';
            $params[] = $filters['isPremium'] ? 1 : 0;
        }
        if (array_key_exists('isFeatured', $filters)) {
            $clauses[] = 'is_featured = ?';
            $params[] = $filters['isFeatured'] ? 1 : 0;
        }
        if (!empty($filters['requireDeviceId'])) {
            $clauses[] = 'device_id IS NOT NULL';
        }
        if (!empty($filters['search'])) {
            $clauses[] = '(MATCH(title, tags) AGAINST (? IN NATURAL LANGUAGE MODE) OR title LIKE ? OR tags LIKE ?)';
            $params[] = $filters['search'];
            $params[] = '%' . $filters['search'] . '%';
            $params[] = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['searchRegexWords'])) {
            // OR-matched substrings across title/tags (mirrors the Mongo regex search in explore.js)
            $orClauses = [];
            foreach ($filters['searchRegexWords'] as $word) {
                $orClauses[] = '(title LIKE ? OR tags LIKE ?)';
                $params[] = '%' . $word . '%';
                $params[] = '%' . $word . '%';
            }
            if (!empty($filters['searchIncludeOwnSource'])) {
                $orClauses[] = 'source = ?';
                $params[] = 'own';
            }
            $clauses[] = '(' . implode(' OR ', $orClauses) . ')';
        }
        if (!empty($filters['idIn'])) {
            $placeholders = implode(',', array_fill(0, count($filters['idIn']), '?'));
            $clauses[] = "id IN ({$placeholders})";
            array_push($params, ...$filters['idIn']);
        }
        if (!empty($filters['idNotIn'])) {
            $placeholders = implode(',', array_fill(0, count($filters['idNotIn']), '?'));
            $clauses[] = "id NOT IN ({$placeholders})";
            array_push($params, ...$filters['idNotIn']);
        }
        if (array_key_exists('deviceId', $filters)) {
            $clauses[] = 'device_id = ?';
            $params[] = $filters['deviceId'];
        }

        $where = $clauses ? 'WHERE ' . implode(' AND ', $clauses) : '';
        return [$where, $params];
    }

    public static function countRandomEligible(array $filters): int
    {
        [$where, $params] = self::buildWhere($filters);
        $stmt = Database::connection()->prepare("SELECT COUNT(*) FROM wallpapers {$where}");
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public static function randomOne(array $filters, int $skip): ?array
    {
        [$where, $params] = self::buildWhere($filters);
        $sql = "SELECT * FROM wallpapers {$where} LIMIT 1 OFFSET {$skip}";
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findMany(array $filters, string $orderBy = 'created_at DESC', ?int $limit = null): array
    {
        [$where, $params] = self::buildWhere($filters);
        $sql = "SELECT * FROM wallpapers {$where} ORDER BY {$orderBy}";
        if ($limit !== null) {
            $sql .= " LIMIT {$limit}";
        }
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function stats(): array
    {
        $db = Database::connection();
        $total = (int) $db->query('SELECT COUNT(*) FROM wallpapers WHERE is_active = 1')->fetchColumn();
        $premium = (int) $db->query('SELECT COUNT(*) FROM wallpapers WHERE is_active = 1 AND is_premium = 1')->fetchColumn();
        $free = (int) $db->query('SELECT COUNT(*) FROM wallpapers WHERE is_active = 1 AND is_premium = 0')->fetchColumn();
        $totalDownloads = (int) $db->query('SELECT COALESCE(SUM(download_count), 0) FROM wallpapers')->fetchColumn();

        return [
            'total' => $total,
            'premium' => $premium,
            'free' => $free,
            'totalDownloads' => $totalDownloads,
        ];
    }

    public static function create(array $data): array
    {
        $id = Id::generate();
        $source = $data['source'] ?? 'own';
        $dedupeKey = self::dedupeKey($source, $data['imageUrl']);

        $tags = self::tagsToText($data['tags'] ?? []);

        $stmt = Database::connection()->prepare(
            'INSERT INTO wallpapers (
                id, title, description, category_id, tags, image_url, thumbnail_url,
                width, height, resolution, cloudinary_id, is_premium, is_active,
                is_featured, dedupe_key, device_id, visibility, approval_status,
                source, photographer, photographer_url, download_location, dominant_color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $stmt->execute([
            $id,
            $data['title'],
            $data['description'] ?? null,
            $data['category'],
            $tags,
            $data['imageUrl'],
            $data['thumbnailUrl'],
            $data['width'] ?? null,
            $data['height'] ?? null,
            $data['resolution'] ?? 'FHD',
            $data['cloudinaryId'] ?? null,
            !empty($data['isPremium']) ? 1 : 0,
            array_key_exists('isActive', $data) ? (int) (bool) $data['isActive'] : 1,
            !empty($data['isFeatured']) ? 1 : 0,
            $dedupeKey,
            $data['deviceId'] ?? null,
            $data['visibility'] ?? 'public',
            $data['approvalStatus'] ?? 'approved',
            $source,
            $data['photographer'] ?? null,
            $data['photographerUrl'] ?? null,
            $data['downloadLocation'] ?? null,
            $data['dominantColor'] ?? '#1a1a2e',
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
            'title' => 'title',
            'description' => 'description',
            'category' => 'category_id',
            'width' => 'width',
            'height' => 'height',
            'resolution' => 'resolution',
            'isPremium' => 'is_premium',
            'isActive' => 'is_active',
            'isFeatured' => 'is_featured',
            'visibility' => 'visibility',
            'approvalStatus' => 'approval_status',
            'source' => 'source',
            'photographer' => 'photographer',
            'photographerUrl' => 'photographer_url',
            'downloadLocation' => 'download_location',
            'downloadCount' => 'download_count',
            'likeCount' => 'like_count',
            'reportCount' => 'report_count',
            'dominantColor' => 'dominant_color',
        ];

        $sets = [];
        $params = [];
        foreach ($fieldMap as $jsonKey => $column) {
            if (array_key_exists($jsonKey, $data)) {
                $value = $data[$jsonKey];
                if (in_array($jsonKey, ['isPremium', 'isActive', 'isFeatured'], true)) {
                    $value = $value ? 1 : 0;
                }
                $sets[] = "{$column} = ?";
                $params[] = $value;
            }
        }
        if (array_key_exists('tags', $data)) {
            $sets[] = 'tags = ?';
            $params[] = self::tagsToText($data['tags']);
        }
        if (array_key_exists('isFeatured', $data) && $data['isFeatured']) {
            $sets[] = 'featured_at = ?';
            $params[] = Dates::nowUtc();
        }

        if (empty($sets)) {
            return $existing;
        }

        $params[] = $id;
        $sql = 'UPDATE wallpapers SET ' . implode(', ', $sets) . ' WHERE id = ?';
        Database::connection()->prepare($sql)->execute($params);

        return self::findById($id);
    }

    public static function setFeatured(string $id, bool $featured): void
    {
        $db = Database::connection();
        if ($featured) {
            $stmt = $db->prepare('UPDATE wallpapers SET is_featured = 1, featured_at = ? WHERE id = ?');
            $stmt->execute([Dates::nowUtc(), $id]);
        } else {
            $stmt = $db->prepare('UPDATE wallpapers SET is_featured = 0 WHERE id = ?');
            $stmt->execute([$id]);
        }
    }

    public static function setApproval(string $id, string $visibility, string $approvalStatus): void
    {
        $stmt = Database::connection()->prepare(
            'UPDATE wallpapers SET visibility = ?, approval_status = ? WHERE id = ?'
        );
        $stmt->execute([$visibility, $approvalStatus, $id]);
    }

    public static function incrementDownloadCount(string $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE wallpapers SET download_count = download_count + 1 WHERE id = ?');
        $stmt->execute([$id]);
        return self::findById($id);
    }

    public static function incrementReportCount(string $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE wallpapers SET report_count = report_count + 1 WHERE id = ?');
        $stmt->execute([$id]);
        $wallpaper = self::findById($id);

        if ($wallpaper && (int) $wallpaper['report_count'] >= 5 && (int) $wallpaper['is_active'] === 1) {
            $db->prepare('UPDATE wallpapers SET is_active = 0 WHERE id = ?')->execute([$id]);
            $wallpaper = self::findById($id);
        }

        return $wallpaper;
    }

    public static function delete(string $id): void
    {
        Database::connection()->prepare('DELETE FROM wallpapers WHERE id = ?')->execute([$id]);
    }

    public static function deleteMany(array $ids): void
    {
        if (empty($ids)) {
            return;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        Database::connection()->prepare("DELETE FROM wallpapers WHERE id IN ({$placeholders})")->execute($ids);
    }

    private static function tagsToText(mixed $tags): ?string
    {
        if (is_string($tags)) {
            $tags = array_filter(array_map('trim', explode(',', $tags)));
        }
        if (!is_array($tags) || empty($tags)) {
            return null;
        }
        $normalized = array_map(fn($t) => strtolower(trim((string) $t)), $tags);
        $normalized = array_values(array_filter($normalized, fn($t) => $t !== ''));
        return $normalized ? implode(',', $normalized) : null;
    }

    public static function tagsToArray(?string $tags): array
    {
        if (!$tags) {
            return [];
        }
        return array_values(array_filter(array_map('trim', explode(',', $tags))));
    }

    /**
     * @param array|null $category Pre-fetched category row (avoids N+1 queries) or null
     *                              to omit population (raw category_id string instead).
     * @param bool $includeCloudinaryId Mirrors `.select('-cloudinaryId')` in the Node routes.
     */
    public static function toJson(array $wallpaper, ?array $category = null, bool $includeCloudinaryId = true): array
    {
        $out = [
            '_id' => $wallpaper['id'],
            'title' => $wallpaper['title'],
            'description' => $wallpaper['description'],
            'category' => $category ? CategoryModel::toRefJson($category) : $wallpaper['category_id'],
            'tags' => self::tagsToArray($wallpaper['tags']),
            'imageUrl' => $wallpaper['image_url'],
            'thumbnailUrl' => $wallpaper['thumbnail_url'],
            'width' => $wallpaper['width'] !== null ? (int) $wallpaper['width'] : null,
            'height' => $wallpaper['height'] !== null ? (int) $wallpaper['height'] : null,
            'resolution' => $wallpaper['resolution'],
            'isPremium' => (bool) $wallpaper['is_premium'],
            'isActive' => (bool) $wallpaper['is_active'],
            'isFeatured' => (bool) $wallpaper['is_featured'],
            'featuredAt' => Dates::iso($wallpaper['featured_at']),
            'deviceId' => $wallpaper['device_id'],
            'visibility' => $wallpaper['visibility'],
            'approvalStatus' => $wallpaper['approval_status'],
            'source' => $wallpaper['source'],
            'photographer' => $wallpaper['photographer'],
            'photographerUrl' => $wallpaper['photographer_url'],
            'downloadLocation' => $wallpaper['download_location'],
            'downloadCount' => (int) $wallpaper['download_count'],
            'likeCount' => (int) $wallpaper['like_count'],
            'reportCount' => (int) $wallpaper['report_count'],
            'dominantColor' => $wallpaper['dominant_color'],
            'createdAt' => Dates::iso($wallpaper['created_at']),
            'updatedAt' => Dates::iso($wallpaper['updated_at']),
        ];

        if ($includeCloudinaryId) {
            $out['cloudinaryId'] = $wallpaper['cloudinary_id'];
        }

        return $out;
    }
}
