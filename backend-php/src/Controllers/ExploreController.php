<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use App\Models\WallpaperModel;
use App\Support\Request;
use App\Support\Response;

class ExploreController
{
    private static array $categoryIcons = [
        'nature' => '🌿', 'space' => '🚀', 'abstract' => '🎨', 'cars' => '🚗', 'city' => '🏙️',
        'animals' => '🦁', 'dark' => '🌑', 'minimal' => '⬜', 'ocean' => '🌊', 'mountains' => '🏔️',
        'flowers' => '🌸', 'architecture' => '🏛️', 'food' => '🍕', 'travel' => '✈️',
    ];

    private function fetchJson(string $url, array $headers = []): ?array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false) {
            return null;
        }
        $decoded = json_decode($response, true);
        return is_array($decoded) ? $decoded : null;
    }

    private function getResolution(int $width): string
    {
        if ($width >= 3840) return '4K';
        if ($width >= 1920) return 'FHD';
        if ($width >= 1280) return 'HD';
        return 'SD';
    }

    private function findOrCreateCategory(string $name): array
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/\s+/', '-', $slug);
        $slug = preg_replace('/[^a-z0-9-]/', '', $slug);
        $slug = substr($slug, 0, 60);

        $icon = self::$categoryIcons[$slug] ?? '🖼️';
        return CategoryModel::findOrCreateBySlug(ucfirst($name), $slug, ['icon' => $icon]);
    }

    private function fetchPexels(string $query, int $page, int $perPage = 10): array
    {
        $apiKey = $_ENV['PEXELS_API_KEY'] ?? '';
        if (!$apiKey) {
            return [];
        }
        $url = 'https://api.pexels.com/v1/search?' . http_build_query([
            'query' => $query, 'per_page' => $perPage, 'page' => $page, 'orientation' => 'portrait',
        ]);
        $data = $this->fetchJson($url, ["Authorization: {$apiKey}"]);
        if (!$data) {
            return [];
        }

        $results = [];
        foreach ($data['photos'] ?? [] as $p) {
            $results[] = [
                'title' => $p['alt'] ?: $query,
                'imageUrl' => $p['src']['original'],
                'thumbnailUrl' => $p['src']['large'],
                'width' => $p['width'],
                'height' => $p['height'],
                'resolution' => $this->getResolution($p['width']),
                'source' => 'pexels',
                'photographer' => $p['photographer'] ?? null,
                'photographerUrl' => $p['photographer_url'] ?? null,
                'tags' => [strtolower($query), 'wallpaper', 'hd'],
            ];
        }
        return $results;
    }

    private function fetchUnsplash(string $query, int $page, int $perPage = 10): array
    {
        $accessKey = $_ENV['UNSPLASH_ACCESS_KEY'] ?? '';
        if (!$accessKey) {
            return [];
        }
        $url = 'https://api.unsplash.com/search/photos?' . http_build_query([
            'query' => $query, 'per_page' => $perPage, 'page' => $page, 'orientation' => 'portrait',
        ]);
        $data = $this->fetchJson($url, ["Authorization: Client-ID {$accessKey}"]);
        if (!$data) {
            return [];
        }

        $results = [];
        foreach ($data['results'] ?? [] as $p) {
            $tags = array_slice(array_map(fn($t) => $t['title'], $p['tags'] ?? []), 0, 3);
            $results[] = [
                'title' => $p['alt_description'] ?: ($p['description'] ?: $query),
                'imageUrl' => $p['urls']['full'],
                'thumbnailUrl' => $p['urls']['regular'],
                'width' => $p['width'],
                'height' => $p['height'],
                'resolution' => $this->getResolution($p['width']),
                'source' => 'unsplash',
                'photographer' => $p['user']['name'] ?? null,
                'photographerUrl' => $p['user']['links']['html'] ?? null,
                'downloadLocation' => $p['links']['download_location'] ?? null,
                'tags' => array_merge([strtolower($query), 'wallpaper'], $tags),
            ];
        }
        return $results;
    }

    /**
     * GET /api/explore?query=nature&page=1
     * Page 1: local DB matches (own uploads first) + Pexels + Unsplash.
     * Page 2+: only Pexels + Unsplash (DB already shown on page 1).
     */
    public function index()
    {
        $query = trim((string) Request::query('query', 'beautiful wallpaper'));
        $page = max(1, (int) Request::query('page', 1));

        $category = $this->findOrCreateCategory($query);

        $dbWallpapers = [];
        if ($page === 1) {
            $words = array_values(array_filter(preg_split('/\s+/', $query)));
            $dbWallpapers = WallpaperModel::findMany([
                'isActive' => true,
                'visibility' => 'public',
                'approvalStatus' => 'approved',
                'searchRegexWords' => $words,
                'searchIncludeOwnSource' => true,
            ], 'source DESC, created_at DESC', 30);
        }

        $pexels = $this->fetchPexels($query, $page, 10);
        $unsplash = $this->fetchUnsplash($query, $page, 10);
        $photos = array_merge($pexels, $unsplash);

        $liveIds = [];
        foreach ($photos as $photo) {
            $existing = WallpaperModel::findByImageUrl($photo['imageUrl']);
            if (!$existing) {
                $existing = WallpaperModel::create(array_merge($photo, [
                    'category' => $category['id'],
                    'isActive' => true,
                    'isPremium' => false,
                    'dominantColor' => '#1a1a2e',
                ]));
                CategoryModel::incrementWallpaperCount($category['id'], 1);
            }
            $liveIds[] = $existing['id'];
        }

        $liveWallpapers = $liveIds ? WallpaperModel::findMany(['idIn' => $liveIds]) : [];

        $seen = [];
        $merged = [];
        foreach (array_merge($dbWallpapers, $liveWallpapers) as $wp) {
            if (!isset($seen[$wp['id']])) {
                $seen[$wp['id']] = true;
                $merged[] = $wp;
            }
        }

        $categories = CategoryModel::findByIds(array_column($merged, 'category_id'));
        $hydrated = array_map(
            fn($wp) => WallpaperModel::toJson($wp, $categories[$wp['category_id']] ?? null, false),
            $merged
        );

        Response::json([
            'wallpapers' => $hydrated,
            'pagination' => ['page' => $page, 'hasMore' => count($photos) > 0],
        ]);
    }
}
