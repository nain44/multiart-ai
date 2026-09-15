<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Controllers\AiController;
use App\Controllers\AppController;
use App\Controllers\AuthController;
use App\Controllers\CategoryController;
use App\Controllers\ExploreController;
use App\Controllers\WallpaperController;
use App\Support\Response;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

// ── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = isset($_ENV['CORS_ORIGINS']) && $_ENV['CORS_ORIGINS'] !== ''
    ? array_map('trim', explode(',', $_ENV['CORS_ORIGINS']))
    : ['*'];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array('*', $allowedOrigins, true)) {
    // Wildcard: reflect the request origin (mobile apps don't send one) so
    // credentials can still be used, matching the Node `origin: true` behavior.
    header('Access-Control-Allow-Origin: ' . ($requestOrigin ?: '*'));
} elseif (in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-device-id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Error handling ───────────────────────────────────────────────────────────
set_exception_handler(function (Throwable $e) {
    error_log('[Error] ' . $e->getMessage());

    // MySQL duplicate key error (e.g. wallpapers.dedupe_key unique index) - the
    // duplicate-insert safety net rejecting an image that already exists.
    if ($e instanceof PDOException && $e->getCode() === '23000') {
        Response::error('This image already exists in the collection.', 409);
    }

    $isDev = ($_ENV['APP_ENV'] ?? 'production') === 'development';
    Response::json(array_filter([
        'message' => $e->getMessage() ?: 'Internal server error',
        'stack' => $isDev ? $e->getTraceAsString() : null,
    ]), 500);
});

// ── Routing ──────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = rtrim($path, '/') ?: '/';

if ($path === '/api/health') {
    Response::json(['status' => 'ok', 'app' => 'MultiArt AI API', 'timestamp' => gmdate('Y-m-d\TH:i:s.v\Z')]);
}

$routes = [
    // ── auth ──
    ['POST', '#^/api/auth/login$#', [AuthController::class, 'login']],
    ['POST', '#^/api/auth/setup$#', [AuthController::class, 'setup']],
    ['GET', '#^/api/auth/me$#', [AuthController::class, 'me']],

    // ── apps registry (super-admin) ──
    ['GET', '#^/api/apps$#', [AppController::class, 'index']],
    ['POST', '#^/api/apps$#', [AppController::class, 'create']],
    ['PUT', '#^/api/apps/(?P<id>[^/]+)$#', [AppController::class, 'update']],
    ['DELETE', '#^/api/apps/(?P<id>[^/]+)$#', [AppController::class, 'destroy']],

    // ── categories ──
    ['GET', '#^/api/categories$#', [CategoryController::class, 'index']],
    ['POST', '#^/api/categories$#', [CategoryController::class, 'create']],
    ['GET', '#^/api/categories/(?P<slug>[^/]+)$#', [CategoryController::class, 'show']],
    ['PUT', '#^/api/categories/(?P<id>[^/]+)$#', [CategoryController::class, 'update']],
    ['DELETE', '#^/api/categories/(?P<id>[^/]+)$#', [CategoryController::class, 'destroy']],

    // ── wallpapers (specific paths before /:id) ──
    ['GET', '#^/api/wallpapers$#', [WallpaperController::class, 'index']],
    ['POST', '#^/api/wallpapers$#', [WallpaperController::class, 'store']],
    ['GET', '#^/api/wallpapers/featured$#', [WallpaperController::class, 'featured']],
    ['GET', '#^/api/wallpapers/random$#', [WallpaperController::class, 'random']],
    ['GET', '#^/api/wallpapers/admin/stats$#', [WallpaperController::class, 'stats']],
    ['GET', '#^/api/wallpapers/admin/ai-queue$#', [WallpaperController::class, 'aiQueue']],
    ['POST', '#^/api/wallpapers/bulk-delete$#', [WallpaperController::class, 'bulkDelete']],
    ['POST', '#^/api/wallpapers/(?P<id>[^/]+)/approve$#', [WallpaperController::class, 'approve']],
    ['POST', '#^/api/wallpapers/(?P<id>[^/]+)/reject$#', [WallpaperController::class, 'reject']],
    ['POST', '#^/api/wallpapers/(?P<id>[^/]+)/download$#', [WallpaperController::class, 'download']],
    ['POST', '#^/api/wallpapers/(?P<id>[^/]+)/report$#', [WallpaperController::class, 'report']],
    ['GET', '#^/api/wallpapers/(?P<id>[^/]+)$#', [WallpaperController::class, 'show']],
    ['PUT', '#^/api/wallpapers/(?P<id>[^/]+)$#', [WallpaperController::class, 'update']],
    ['DELETE', '#^/api/wallpapers/(?P<id>[^/]+)$#', [WallpaperController::class, 'destroy']],

    // ── explore ──
    ['GET', '#^/api/explore$#', [ExploreController::class, 'index']],

    // ── ai ──
    ['POST', '#^/api/ai/generate$#', [AiController::class, 'generate']],
    ['GET', '#^/api/ai/mine$#', [AiController::class, 'mine']],
    ['POST', '#^/api/ai/(?P<id>[^/]+)/request-public$#', [AiController::class, 'requestPublic']],
    ['POST', '#^/api/ai/(?P<id>[^/]+)/make-private$#', [AiController::class, 'makePrivate']],
];

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

Response::error('Not found', 404);
