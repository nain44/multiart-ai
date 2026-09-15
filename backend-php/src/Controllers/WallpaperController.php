<?php

namespace App\Controllers;

use App\Auth;
use App\Models\CategoryModel;
use App\Models\WallpaperModel;
use App\Services\CloudinaryService;
use App\Support\Request;
use App\Support\Response;

class WallpaperController
{
    private const FEATURED_LIMIT = 8;

    /** Batch-populates the `category` field for a list of wallpaper rows. */
    private function hydrate(array $rows, bool $includeCloudinaryId = false): array
    {
        $categories = CategoryModel::findByIds(array_column($rows, 'category_id'));
        return array_map(
            fn($row) => WallpaperModel::toJson($row, $categories[$row['category_id']] ?? null, $includeCloudinaryId),
            $rows
        );
    }

    /** GET /api/wallpapers */
    public function index()
    {
        $page = (int) Request::query('page', 1);
        $limit = (int) Request::query('limit', 20);
        $category = Request::query('category');
        $isPremium = Request::query('isPremium');
        $isFeatured = Request::query('isFeatured');
        $search = Request::query('search');
        $sort = Request::query('sort', 'createdAt');

        $filters = ['isActive' => true, 'visibility' => 'public', 'approvalStatus' => 'approved'];
        if ($category) {
            $filters['category'] = $category;
        }
        if ($isPremium !== null) {
            $filters['isPremium'] = $isPremium === 'true';
        }
        if ($isFeatured !== null) {
            $filters['isFeatured'] = $isFeatured === 'true';
        }
        if ($search) {
            $filters['search'] = $search;
        }

        $result = WallpaperModel::paginate($filters, ['page' => $page, 'limit' => $limit, 'sort' => $sort]);

        Response::json([
            'wallpapers' => $this->hydrate($result['rows']),
            'pagination' => [
                'page' => $result['page'],
                'limit' => $result['limit'],
                'total' => $result['total'],
                'pages' => (int) ceil($result['total'] / $result['limit']),
            ],
        ]);
    }

    /**
     * GET /api/wallpapers/featured
     * Admin-picked wallpapers (isFeatured, most recently pinned first) fill the
     * hero/featured section first; remaining slots (up to FEATURED_LIMIT) are
     * filled by download count.
     */
    public function featured()
    {
        $base = ['isActive' => true, 'visibility' => 'public', 'approvalStatus' => 'approved'];

        $pinned = WallpaperModel::findMany(
            array_merge($base, ['isFeatured' => true]),
            'featured_at DESC',
            self::FEATURED_LIMIT
        );

        if (count($pinned) >= self::FEATURED_LIMIT) {
            Response::json($this->hydrate($pinned));
        }

        $fillers = WallpaperModel::findMany(
            array_merge($base, ['idNotIn' => array_column($pinned, 'id')]),
            'download_count DESC',
            self::FEATURED_LIMIT - count($pinned)
        );

        Response::json($this->hydrate(array_merge($pinned, $fillers)));
    }

    /** GET /api/wallpapers/random */
    public function random()
    {
        $filters = ['isActive' => true, 'isPremium' => false, 'visibility' => 'public', 'approvalStatus' => 'approved'];
        $count = WallpaperModel::countRandomEligible($filters);
        if ($count === 0) {
            Response::json(null);
        }
        $skip = random_int(0, $count - 1);
        $wallpaper = WallpaperModel::randomOne($filters, $skip);
        Response::json($wallpaper ? $this->hydrate([$wallpaper])[0] : null);
    }

    /** GET /api/wallpapers/admin/stats (admin) */
    public function stats()
    {
        Auth::requireAdmin();
        Response::json(WallpaperModel::stats());
    }

    /** GET /api/wallpapers/admin/ai-queue?status=pending (admin) */
    public function aiQueue()
    {
        Auth::requireAdmin();
        $status = Request::query('status', 'pending');

        $rows = WallpaperModel::findMany([
            'visibility' => 'public',
            'approvalStatus' => $status,
            'requireDeviceId' => true,
        ], 'created_at DESC');

        Response::json($this->hydrate($rows));
    }

    /** POST /api/wallpapers/:id/approve (admin) */
    public function approve(string $id)
    {
        Auth::requireAdmin();

        $wallpaper = WallpaperModel::findById($id);
        if (!$wallpaper) {
            Response::error('Wallpaper not found', 404);
        }

        $wasAlreadyApproved = $wallpaper['visibility'] === 'public' && $wallpaper['approval_status'] === 'approved';
        WallpaperModel::setApproval($id, 'public', 'approved');

        if (!$wasAlreadyApproved) {
            CategoryModel::incrementWallpaperCount($wallpaper['category_id'], 1);
        }

        $updated = WallpaperModel::findById($id);
        Response::json($this->hydrate([$updated], true)[0]);
    }

    /** POST /api/wallpapers/:id/reject (admin) */
    public function reject(string $id)
    {
        Auth::requireAdmin();

        $wallpaper = WallpaperModel::findById($id);
        if (!$wallpaper) {
            Response::error('Wallpaper not found', 404);
        }

        WallpaperModel::setApproval($id, $wallpaper['visibility'], 'rejected');

        $updated = WallpaperModel::findById($id);
        Response::json($this->hydrate([$updated], true)[0]);
    }

    /** GET /api/wallpapers/:id */
    public function show(string $id)
    {
        $wallpaper = WallpaperModel::findById($id);
        if (!$wallpaper || !$wallpaper['is_active']) {
            Response::error('Wallpaper not found', 404);
        }

        $isPublicApproved = $wallpaper['visibility'] === 'public' && $wallpaper['approval_status'] === 'approved';
        if (!$isPublicApproved) {
            $deviceId = Request::header('x-device-id');
            if (!$deviceId || $wallpaper['device_id'] !== $deviceId) {
                Response::error('Wallpaper not found', 404);
            }
        }

        Response::json($this->hydrate([$wallpaper])[0]);
    }

    /** POST /api/wallpapers/:id/download */
    public function download(string $id)
    {
        $wallpaper = WallpaperModel::incrementDownloadCount($id);

        if ($wallpaper && $wallpaper['source'] === 'unsplash' && $wallpaper['download_location']) {
            $accessKey = $_ENV['UNSPLASH_ACCESS_KEY'] ?? '';
            if ($accessKey) {
                $ch = curl_init($wallpaper['download_location']);
                curl_setopt_array($ch, [
                    CURLOPT_HTTPHEADER => ["Authorization: Client-ID {$accessKey}"],
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => 10,
                ]);
                curl_exec($ch);
                curl_close($ch);
            }
        }

        Response::json(['success' => true]);
    }

    /** POST /api/wallpapers (admin) — multer(memory) -> Cloudinary v2 equivalent */
    public function store()
    {
        Auth::requireAdmin();

        $file = Request::file('image');
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Image file is required', 400);
        }
        if (!str_starts_with($file['type'], 'image/')) {
            Response::error('Only image files are allowed', 400);
        }

        $category = Request::input('category');
        $tags = Request::input('tags');

        $cloudinary = new CloudinaryService();
        $result = $cloudinary->uploadFile($file['tmp_name'], $file['name']);

        $imageUrl = $result['secure_url'];
        $thumbnailUrl = CloudinaryService::thumbnailUrl($imageUrl, 400, 700);

        try {
            $wallpaper = WallpaperModel::create([
                'title' => Request::input('title'),
                'description' => Request::input('description'),
                'category' => $category,
                'tags' => $tags ?: [],
                'imageUrl' => $imageUrl,
                'thumbnailUrl' => $thumbnailUrl,
                'cloudinaryId' => $result['public_id'],
                'isPremium' => Request::input('isPremium') === 'true',
                'resolution' => Request::input('resolution') ?: 'FHD',
                'source' => Request::input('source') ?: 'own',
                'photographer' => Request::input('photographer'),
                'photographerUrl' => Request::input('photographerUrl'),
                'dominantColor' => Request::input('dominantColor') ?: '#1a1a2e',
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                $cloudinary->destroy($result['public_id']);
                Response::error('This image already exists in the collection.', 409);
            }
            throw $e;
        }

        CategoryModel::incrementWallpaperCount($category, 1);

        Response::json($this->hydrate([$wallpaper], true)[0], 201);
    }

    /** PUT /api/wallpapers/:id (admin) */
    public function update(string $id)
    {
        Auth::requireAdmin();

        // Prevent overwriting sensitive computed fields, mirroring the Node route.
        $updates = Request::all();
        unset($updates['cloudinaryId'], $updates['imageUrl'], $updates['thumbnailUrl'], $updates['downloadCount']);

        $wallpaper = WallpaperModel::update($id, $updates);
        if (!$wallpaper) {
            Response::error('Wallpaper not found', 404);
        }

        Response::json($this->hydrate([$wallpaper])[0]);
    }

    /** DELETE /api/wallpapers/:id (admin) */
    public function destroy(string $id)
    {
        Auth::requireAdmin();

        $wallpaper = WallpaperModel::findById($id);
        if (!$wallpaper) {
            Response::error('Wallpaper not found', 404);
        }

        (new CloudinaryService())->destroy($wallpaper['cloudinary_id']);
        WallpaperModel::delete($id);
        CategoryModel::incrementWallpaperCount($wallpaper['category_id'], -1);

        Response::json(['message' => 'Wallpaper deleted successfully']);
    }

    /** POST /api/wallpapers/bulk-delete (admin) */
    public function bulkDelete()
    {
        Auth::requireAdmin();

        $ids = Request::input('ids');
        if (!is_array($ids) || empty($ids)) {
            Response::error('ids must be a non-empty array', 400);
        }

        $wallpapers = WallpaperModel::findMany(['idIn' => $ids]);

        $cloudinary = new CloudinaryService();
        $categoryDecrements = [];
        foreach ($wallpapers as $wallpaper) {
            $cloudinary->destroy($wallpaper['cloudinary_id']);
            $key = $wallpaper['category_id'];
            $categoryDecrements[$key] = ($categoryDecrements[$key] ?? 0) + 1;
        }

        WallpaperModel::deleteMany(array_column($wallpapers, 'id'));

        foreach ($categoryDecrements as $categoryId => $count) {
            CategoryModel::incrementWallpaperCount($categoryId, -$count);
        }

        Response::json([
            'message' => count($wallpapers) . ' wallpaper(s) deleted successfully',
            'deletedCount' => count($wallpapers),
        ]);
    }

    /** POST /api/wallpapers/:id/report */
    public function report(string $id)
    {
        $wallpaper = WallpaperModel::incrementReportCount($id);
        if (!$wallpaper) {
            Response::error('Wallpaper not found', 404);
        }
        Response::json(['success' => true, 'message' => 'Wallpaper reported successfully']);
    }
}
