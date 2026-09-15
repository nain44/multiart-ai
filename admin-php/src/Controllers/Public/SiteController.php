<?php

namespace App\Controllers\Public;

use App\Support\ApiClient;
use App\Support\ApiException;
use App\Support\View;

/**
 * The public wallpapers website — ported from the old Next.js `website/` app.
 * No auth; talks to backend-php's public /api/* endpoints only.
 */
class SiteController
{
    private const PAGE_SIZE = 24;

    private function client(): ApiClient
    {
        return new ApiClient();
    }

    public function home()
    {
        $client = $this->client();
        $featured = [];
        $categories = [];
        try {
            $featured = $client->get('/api/wallpapers/featured');
            $categories = $client->get('/api/categories');
        } catch (ApiException $e) {
            // Backend unreachable: render the page with empty sections rather than a hard error.
        }

        View::renderSite('site/home', [
            'featured' => $featured,
            'categories' => $categories,
        ]);
    }

    public function wallpapersList()
    {
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $search = trim($_GET['search'] ?? '');

        $query = ['page' => $page, 'limit' => self::PAGE_SIZE];
        if ($search !== '') {
            $query['search'] = $search;
        }

        $result = $this->client()->get('/api/wallpapers', $query);

        View::renderSite('site/wallpapers-list', [
            'wallpapers' => $result['wallpapers'] ?? [],
            'pagination' => $result['pagination'] ?? ['page' => 1, 'pages' => 1, 'total' => 0],
            'search' => $search,
            'pageTitle' => $search !== '' ? "Search: {$search}" : 'Wallpapers',
            'pageDescription' => 'Browse free HD wallpapers for your phone.',
        ]);
    }

    public function wallpaperDetail(string $id)
    {
        try {
            $wp = $this->client()->get("/api/wallpapers/{$id}");
        } catch (ApiException $e) {
            $this->notFound();
            return;
        }
        if (!$wp || !isset($wp['_id'])) {
            $this->notFound();
            return;
        }

        View::renderSite('site/wallpaper-detail', [
            'wp' => $wp,
            'pageTitle' => $wp['title'] . ' — Free Download',
            'pageDescription' => $wp['description'] ?: ('Download "' . $wp['title'] . '" — a free high-quality wallpaper.'),
            'ogImage' => $wp['thumbnailUrl'],
        ]);
    }

    public function categoriesList()
    {
        $categories = $this->client()->get('/api/categories');

        View::renderSite('site/categories-list', [
            'categories' => $categories,
            'pageTitle' => 'Categories',
            'pageDescription' => 'Browse wallpapers by category.',
        ]);
    }

    public function categoryDetail(string $slug)
    {
        try {
            $category = $this->client()->get("/api/categories/{$slug}");
        } catch (ApiException $e) {
            $this->notFound();
            return;
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $result = $this->client()->get('/api/wallpapers', [
            'category' => $category['_id'],
            'page' => $page,
            'limit' => self::PAGE_SIZE,
        ]);

        View::renderSite('site/category-detail', [
            'category' => $category,
            'wallpapers' => $result['wallpapers'] ?? [],
            'pagination' => $result['pagination'] ?? ['page' => 1, 'pages' => 1, 'total' => 0],
            'pageTitle' => $category['icon'] . ' ' . $category['name'],
            'pageDescription' => $category['wallpaperCount'] . ' wallpapers in ' . $category['name'] . '.',
        ]);
    }

    public function privacyPolicy()
    {
        View::renderSite('site/privacy-policy', ['pageTitle' => 'Privacy Policy']);
    }

    public function terms()
    {
        View::renderSite('site/terms', ['pageTitle' => 'Terms']);
    }

    /** POST /api/track-download?id= — fire-and-forget proxy to the backend's download counter. */
    public function trackDownload()
    {
        $id = $_GET['id'] ?? '';
        if ($id) {
            try {
                $this->client()->post("/api/wallpapers/{$id}/download");
            } catch (ApiException $e) {
                // fire-and-forget
            }
        }
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    }

    public function sitemap()
    {
        $siteUrl = rtrim($_ENV['SITE_URL'] ?? 'https://multiartai.app', '/');
        $urls = [
            ['loc' => '/', 'changefreq' => 'daily', 'priority' => '1.0'],
            ['loc' => '/wallpapers', 'changefreq' => 'daily', 'priority' => '0.9'],
            ['loc' => '/categories', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => '/privacy-policy', 'changefreq' => 'yearly', 'priority' => '0.3'],
            ['loc' => '/terms', 'changefreq' => 'yearly', 'priority' => '0.3'],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        $now = gmdate('c');
        foreach ($urls as $u) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$siteUrl}{$u['loc']}</loc>\n";
            $xml .= "    <lastmod>{$now}</lastmod>\n";
            $xml .= "    <changefreq>{$u['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$u['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>';

        View::renderRaw($xml, 'application/xml');
    }

    public function robots()
    {
        $siteUrl = rtrim($_ENV['SITE_URL'] ?? 'https://multiartai.app', '/');
        $body = "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: {$siteUrl}/sitemap.xml\n";
        View::renderRaw($body, 'text/plain');
    }

    private function notFound()
    {
        http_response_code(404);
        View::renderSite('site/not-found', ['pageTitle' => 'Not Found']);
    }
}
