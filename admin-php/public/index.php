<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Controllers\AuthController;
use App\Controllers\HomeController;
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
    ['GET', '#^/login$#', [AuthController::class, 'showLogin']],
    ['POST', '#^/login$#', [AuthController::class, 'login']],
    ['POST', '#^/logout$#', [AuthController::class, 'logout']],

    ['GET', '#^/$#', [HomeController::class, 'index']],
    ['GET', '#^/apps/(?P<key>[^/]+)$#', [HomeController::class, 'show']],
    ['POST', '#^/apps$#', [HomeController::class, 'create']],
    ['POST', '#^/apps/(?P<id>[^/]+)/update$#', [HomeController::class, 'update']],
    ['POST', '#^/apps/(?P<id>[^/]+)/delete$#', [HomeController::class, 'destroy']],

    ['GET', '#^/wallpapers/dashboard$#', [DashboardController::class, 'index']],

    ['GET', '#^/wallpapers/categories$#', [CategoryController::class, 'index']],
    ['POST', '#^/wallpapers/categories$#', [CategoryController::class, 'create']],
    ['POST', '#^/wallpapers/categories/(?P<id>[^/]+)/delete$#', [CategoryController::class, 'destroy']],

    ['GET', '#^/wallpapers/upload$#', [UploadController::class, 'show']],
    ['POST', '#^/wallpapers/upload$#', [UploadController::class, 'store']],

    ['GET', '#^/wallpapers/ai-queue$#', [AiQueueController::class, 'index']],
    ['POST', '#^/wallpapers/ai-queue/(?P<id>[^/]+)/approve$#', [AiQueueController::class, 'approve']],
    ['POST', '#^/wallpapers/ai-queue/(?P<id>[^/]+)/reject$#', [AiQueueController::class, 'reject']],
    ['POST', '#^/wallpapers/ai-queue/(?P<id>[^/]+)/delete$#', [AiQueueController::class, 'delete']],
    ['POST', '#^/wallpapers/ai-queue/clear-rejected$#', [AiQueueController::class, 'clearRejected']],

    ['POST', '#^/wallpapers/bulk-delete$#', [WallpaperController::class, 'bulkDelete']],
    ['POST', '#^/wallpapers/(?P<id>[^/]+)/toggle-premium$#', [WallpaperController::class, 'togglePremium']],
    ['POST', '#^/wallpapers/(?P<id>[^/]+)/toggle-featured$#', [WallpaperController::class, 'toggleFeatured']],
    ['POST', '#^/wallpapers/(?P<id>[^/]+)/delete$#', [WallpaperController::class, 'destroy']],
    ['GET', '#^/wallpapers$#', [WallpaperController::class, 'index']],
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
