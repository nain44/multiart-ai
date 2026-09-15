<?php

declare(strict_types=1);

// When run via `php -S ... public/index.php` (see README), the built-in
// server hands every request to this script — including real static files
// under public/. Let it serve those directly instead of 404ing through our
// router. A real webserver's rewrite rules already skip real files before
// ever reaching this script, so this only matters for local dev.
if (PHP_SAPI === 'cli-server') {
    $requestedFile = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($requestedFile !== __DIR__ . '/' && is_file($requestedFile)) {
        return false;
    }
}

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Controllers\AuthController;
use App\Controllers\HomeController;
use App\Controllers\Public\SiteController;
use App\Controllers\Wallpapers\AiQueueController;
use App\Controllers\Wallpapers\CategoryController;
use App\Controllers\Wallpapers\DashboardController;
use App\Controllers\Wallpapers\UploadController;
use App\Controllers\Wallpapers\WallpaperController;
use App\Support\ApiException;
use App\Support\Session;
use App\Support\View;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

View::init(dirname(__DIR__) . '/src/Views');
Session::start();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = rtrim($path, '/') ?: '/';

$routes = [
    // ── public wallpapers website (root namespace — matches the old site's real URLs) ──
    ['GET', '#^/$#', [SiteController::class, 'home']],
    ['GET', '#^/wallpapers$#', [SiteController::class, 'wallpapersList']],
    ['GET', '#^/wallpapers/(?P<id>[^/]+)$#', [SiteController::class, 'wallpaperDetail']],
    ['GET', '#^/categories$#', [SiteController::class, 'categoriesList']],
    ['GET', '#^/categories/(?P<slug>[^/]+)$#', [SiteController::class, 'categoryDetail']],
    ['GET', '#^/privacy-policy$#', [SiteController::class, 'privacyPolicy']],
    ['GET', '#^/terms$#', [SiteController::class, 'terms']],
    ['POST', '#^/api/track-download$#', [SiteController::class, 'trackDownload']],
    ['GET', '#^/sitemap\.xml$#', [SiteController::class, 'sitemap']],
    ['GET', '#^/robots\.txt$#', [SiteController::class, 'robots']],

    // ── admin panel (super-admin only, under /admin) ──
    ['GET', '#^/admin/login$#', [AuthController::class, 'showLogin']],
    ['POST', '#^/admin/login$#', [AuthController::class, 'login']],
    ['POST', '#^/admin/logout$#', [AuthController::class, 'logout']],

    ['GET', '#^/admin/?$#', [HomeController::class, 'index']],
    ['GET', '#^/admin/apps/(?P<key>[^/]+)$#', [HomeController::class, 'show']],
    ['POST', '#^/admin/apps$#', [HomeController::class, 'create']],
    ['POST', '#^/admin/apps/(?P<id>[^/]+)/update$#', [HomeController::class, 'update']],
    ['POST', '#^/admin/apps/(?P<id>[^/]+)/delete$#', [HomeController::class, 'destroy']],

    ['GET', '#^/admin/wallpapers/dashboard$#', [DashboardController::class, 'index']],

    ['GET', '#^/admin/wallpapers/categories$#', [CategoryController::class, 'index']],
    ['POST', '#^/admin/wallpapers/categories$#', [CategoryController::class, 'create']],
    ['POST', '#^/admin/wallpapers/categories/(?P<id>[^/]+)/delete$#', [CategoryController::class, 'destroy']],

    ['GET', '#^/admin/wallpapers/upload$#', [UploadController::class, 'show']],
    ['POST', '#^/admin/wallpapers/upload$#', [UploadController::class, 'store']],

    ['GET', '#^/admin/wallpapers/ai-queue$#', [AiQueueController::class, 'index']],
    ['POST', '#^/admin/wallpapers/ai-queue/(?P<id>[^/]+)/approve$#', [AiQueueController::class, 'approve']],
    ['POST', '#^/admin/wallpapers/ai-queue/(?P<id>[^/]+)/reject$#', [AiQueueController::class, 'reject']],
    ['POST', '#^/admin/wallpapers/ai-queue/(?P<id>[^/]+)/delete$#', [AiQueueController::class, 'delete']],
    ['POST', '#^/admin/wallpapers/ai-queue/clear-rejected$#', [AiQueueController::class, 'clearRejected']],

    ['POST', '#^/admin/wallpapers/bulk-delete$#', [WallpaperController::class, 'bulkDelete']],
    ['POST', '#^/admin/wallpapers/(?P<id>[^/]+)/toggle-premium$#', [WallpaperController::class, 'togglePremium']],
    ['POST', '#^/admin/wallpapers/(?P<id>[^/]+)/toggle-featured$#', [WallpaperController::class, 'toggleFeatured']],
    ['POST', '#^/admin/wallpapers/(?P<id>[^/]+)/delete$#', [WallpaperController::class, 'destroy']],
    ['GET', '#^/admin/wallpapers$#', [WallpaperController::class, 'index']],
];

try {
    foreach ($routes as [$routeMethod, $pattern, $handler]) {
        if ($routeMethod !== $method) {
            continue;
        }
        if (preg_match($pattern, $path, $matches)) {
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            [$class, $action] = $handler;
            $controller = new $class();
            $controller->$action(...array_values($params));
            exit;
        }
    }
    http_response_code(404);
    echo 'Not found';
} catch (ApiException $e) {
    if ($e->status === 401) {
        Session::logout();
        Session::flash('error', 'Your session expired. Please log in again.');
        header('Location: /login');
        exit;
    }
    Session::flash('error', $e->getMessage());
    $refererPath = isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH) : null;
    header('Location: ' . ($refererPath ?: '/'));
    exit;
}
