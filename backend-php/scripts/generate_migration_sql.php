<?php
/**
 * Generates a plain SQL dump (INSERT statements) from the exported
 * MongoDB JSON files, for direct import via phpMyAdmin — no PHP web
 * request/timeout involved. Run locally: php generate_migration_sql.php
 */

declare(strict_types=1);

$exportDir = __DIR__ . '/../../migration-export';
$outPath = __DIR__ . '/../../migration-data.sql';

function isoToMysql(?string $iso): ?string
{
    if (!$iso) {
        return null;
    }
    $dt = new DateTime($iso, new DateTimeZone('UTC'));
    return $dt->format('Y-m-d H:i:s.v');
}

function normalizeImageUrl(?string $url): string
{
    if (!$url) {
        return '';
    }
    $normalized = strtolower(trim($url));
    return preg_replace('/[?&](width|height|seed|fit|crop|nologo)=[^&]*/i', '', $normalized);
}

function sqlVal($v): string
{
    global $pdoQuoteFallback;
    if ($v === null) {
        return 'NULL';
    }
    if (is_bool($v)) {
        return $v ? '1' : '0';
    }
    if (is_int($v) || is_float($v)) {
        return (string) $v;
    }
    // Manual escaping (no live DB connection needed): backslash and quote,
    // matching MySQL's default (non-NO_BACKSLASH_ESCAPES) string literal rules.
    $escaped = str_replace(['\\', "'"], ['\\\\', "\\'"], (string) $v);
    return "'" . $escaped . "'";
}

$admins = json_decode(file_get_contents($exportDir . '/admins.json'), true);
$categories = json_decode(file_get_contents($exportDir . '/categories.json'), true);
$wallpapers = json_decode(file_get_contents($exportDir . '/wallpapers.json'), true);

$sql = [];
$sql[] = "SET NAMES utf8mb4;";
$sql[] = "SET FOREIGN_KEY_CHECKS=0;";
$sql[] = "";

// ── Admins ───────────────────────────────────────────────────────────────
$sql[] = "-- Admins (" . count($admins) . ")";
foreach ($admins as $a) {
    $sql[] = "INSERT IGNORE INTO admins (id, name, email, password_hash, role, created_at, updated_at) VALUES ("
        . implode(', ', [
            sqlVal($a['_id']),
            sqlVal($a['name'] ?? 'Admin'),
            sqlVal(strtolower($a['email'])),
            sqlVal($a['passwordHash']),
            sqlVal($a['role'] ?? 'super'),
            sqlVal(isoToMysql($a['createdAt'] ?? null) ?? date('Y-m-d H:i:s')),
            sqlVal(isoToMysql($a['updatedAt'] ?? null) ?? date('Y-m-d H:i:s')),
        ]) . ");";
}
$sql[] = "";

// ── Categories ───────────────────────────────────────────────────────────
$catIds = [];
$sql[] = "-- Categories (" . count($categories) . ")";
foreach ($categories as $c) {
    $catIds[$c['_id']] = true;
    $sql[] = "INSERT IGNORE INTO categories (id, name, slug, icon, cover_image_url, description, `order`, is_active, wallpaper_count, created_at, updated_at) VALUES ("
        . implode(', ', [
            sqlVal($c['_id']),
            sqlVal($c['name']),
            sqlVal(strtolower($c['slug'])),
            sqlVal($c['icon'] ?? "\u{1F5BC}"),
            sqlVal($c['coverImageUrl'] ?? null),
            sqlVal($c['description'] ?? null),
            sqlVal($c['order'] ?? 0),
            sqlVal(!empty($c['isActive'])),
            sqlVal($c['wallpaperCount'] ?? 0),
            sqlVal(isoToMysql($c['createdAt'] ?? null) ?? date('Y-m-d H:i:s')),
            sqlVal(isoToMysql($c['updatedAt'] ?? null) ?? date('Y-m-d H:i:s')),
        ]) . ");";
}
$sql[] = "";

// ── Wallpapers ───────────────────────────────────────────────────────────
$skipped = 0;
$sql[] = "-- Wallpapers (" . count($wallpapers) . ")";
foreach ($wallpapers as $w) {
    $categoryId = $w['category'] ?? null;
    if (!$categoryId || !isset($catIds[$categoryId])) {
        $skipped++;
        continue;
    }

    $tags = $w['tags'] ?? [];
    $tagsStr = $tags ? implode(',', array_map(fn($t) => strtolower(trim($t)), $tags)) : null;

    $source = $w['source'] ?? 'own';
    $base = normalizeImageUrl($w['imageUrl'] ?? null);
    $dedupeKey = $base ? "$source|$base" : null;

    $cols = [
        'id', 'title', 'description', 'category_id', 'tags', 'image_url', 'thumbnail_url',
        'width', 'height', 'resolution', 'cloudinary_id', 'is_premium', 'is_active',
        'is_featured', 'featured_at', 'dedupe_key', 'device_id', 'visibility', 'approval_status',
        'source', 'photographer', 'photographer_url', 'download_location',
        'download_count', 'like_count', 'report_count', 'dominant_color', 'created_at', 'updated_at',
    ];
    $vals = [
        sqlVal($w['_id']),
        sqlVal($w['title']),
        sqlVal($w['description'] ?? null),
        sqlVal($categoryId),
        sqlVal($tagsStr),
        sqlVal($w['imageUrl']),
        sqlVal($w['thumbnailUrl']),
        sqlVal($w['width'] ?? null),
        sqlVal($w['height'] ?? null),
        sqlVal($w['resolution'] ?? 'FHD'),
        sqlVal($w['cloudinaryId'] ?? null),
        sqlVal(!empty($w['isPremium'])),
        sqlVal(array_key_exists('isActive', $w) ? !empty($w['isActive']) : true),
        sqlVal(!empty($w['isFeatured'])),
        sqlVal(isoToMysql($w['featuredAt'] ?? null)),
        sqlVal($dedupeKey),
        sqlVal($w['deviceId'] ?? null),
        sqlVal($w['visibility'] ?? 'public'),
        sqlVal($w['approvalStatus'] ?? 'approved'),
        sqlVal($source),
        sqlVal($w['photographer'] ?? null),
        sqlVal($w['photographerUrl'] ?? null),
        sqlVal($w['downloadLocation'] ?? null),
        sqlVal($w['downloadCount'] ?? 0),
        sqlVal($w['likeCount'] ?? 0),
        sqlVal($w['reportCount'] ?? 0),
        sqlVal($w['dominantColor'] ?? '#1a1a2e'),
        sqlVal(isoToMysql($w['createdAt'] ?? null) ?? date('Y-m-d H:i:s')),
        sqlVal(isoToMysql($w['updatedAt'] ?? null) ?? date('Y-m-d H:i:s')),
    ];
    $sql[] = "INSERT IGNORE INTO wallpapers (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ");";
}
$sql[] = "";
$sql[] = "SET FOREIGN_KEY_CHECKS=1;";

file_put_contents($outPath, implode("\n", $sql) . "\n");

fwrite(STDERR, "Wrote " . count($admins) . " admin(s), " . count($categories) . " categor(ies), "
    . (count($wallpapers) - $skipped) . " wallpaper(s) (skipped $skipped orphan(s)) to $outPath\n");
