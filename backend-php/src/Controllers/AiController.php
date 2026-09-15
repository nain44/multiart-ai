<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use App\Models\DeviceQuotaModel;
use App\Models\WallpaperModel;
use App\Services\CloudinaryService;
use App\Services\ContentFilter;
use App\Support\Request;
use App\Support\Response;

class AiController
{
    // Anti-abuse safety net, not the product's free/premium quota (that's client-side).
    private const MAX_GENERATIONS_PER_DEVICE_PER_DAY = 50;

    /** POST /api/ai/generate */
    public function generate()
    {
        $prompt = Request::input('prompt');
        $visibility = Request::input('visibility');
        $deviceId = Request::header('x-device-id');

        if (!is_string($prompt) || trim($prompt) === '') {
            Response::error('Prompt is required and must be a non-empty string', 400);
        }

        if ($visibility !== null && $visibility !== 'private' && $visibility !== 'public') {
            Response::error('visibility must be "private" or "public"', 400);
        }
        // Private by default; a device-less (old app) client can only create private
        // wallpapers, since there'd be no way to attribute ownership later.
        $requestedVisibility = ($deviceId && $visibility === 'public') ? 'public' : 'private';

        $promptCheck = ContentFilter::validateAiPrompt($prompt);
        if (!$promptCheck['isValid']) {
            Response::error($promptCheck['error'], 400);
        }

        try {
            $quota = null;
            if ($deviceId) {
                $quota = DeviceQuotaModel::findOrCreateToday($deviceId);
                if ((int) $quota['count'] >= self::MAX_GENERATIONS_PER_DEVICE_PER_DAY) {
                    Response::error('Daily AI generation limit reached for this device. Please try again tomorrow.', 429);
                }
            }

            $cleanPrompt = trim($prompt);
            $seed = random_int(0, 999999);
            $generatorUrl = 'https://image.pollinations.ai/prompt/' . rawurlencode($cleanPrompt)
                . "?width=1080&height=1920&nologo=true&seed={$seed}&model=flux";

            $tmpFile = tempnam(sys_get_temp_dir(), 'ai-gen-');
            $ok = $this->downloadTo($generatorUrl, $tmpFile);
            if (!$ok) {
                @unlink($tmpFile);
                throw new \RuntimeException('AI generation service did not return an image');
            }

            $cloudinary = new CloudinaryService();
            $cloudinaryResult = $cloudinary->uploadFile($tmpFile, 'ai-gen-' . time() . '.png');
            @unlink($tmpFile);

            $category = CategoryModel::findOrCreateBySlug('AI Art', 'ai-art', [
                'icon' => '🤖',
                'coverImageUrl' => 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600',
                'description' => 'Wallpapers generated using Artificial Intelligence prompts',
                'order' => 99,
            ]);

            $promptTags = array_values(array_filter(
                preg_split('/[\s,]+/', preg_replace('/[^a-zA-Z0-9\s,]/', '', strtolower($cleanPrompt))),
                fn($tag) => strlen($tag) > 2 && strlen($tag) < 15
            ));
            $promptTags = array_slice($promptTags, 0, 5);
            $allTags = array_values(array_unique(array_merge(['ai', 'generated', 'flux'], $promptTags)));

            $title = ucfirst($cleanPrompt);
            if (strlen($title) > 40) {
                $title = substr($title, 0, 37) . '...';
            }

            try {
                $wallpaper = WallpaperModel::create([
                    'title' => $title,
                    'description' => "AI Generated wallpaper for prompt: \"{$cleanPrompt}\"",
                    'category' => $category['id'],
                    'tags' => $allTags,
                    'imageUrl' => $cloudinaryResult['secure_url'],
                    'thumbnailUrl' => CloudinaryService::thumbnailUrl($cloudinaryResult['secure_url']),
                    'width' => 1080,
                    'height' => 1920,
                    'resolution' => 'FHD',
                    'cloudinaryId' => $cloudinaryResult['public_id'],
                    'isPremium' => false,
                    'source' => 'own',
                    'photographer' => 'AI Generator',
                    'photographerUrl' => '',
                    'deviceId' => $deviceId ?: null,
                    'visibility' => $requestedVisibility,
                    'approvalStatus' => $requestedVisibility === 'public' ? 'pending' : 'approved',
                ]);
            } catch (\PDOException $e) {
                if ($e->getCode() === '23000') {
                    $cloudinary->destroy($cloudinaryResult['public_id']);
                }
                throw $e;
            }

            // Count only after a successful generation, so failed attempts don't burn quota.
            if ($quota) {
                DeviceQuotaModel::increment($quota['id']);
            }

            // Category counts only reflect publicly-browsable wallpapers; incremented on admin approval instead.

            Response::json(WallpaperModel::toJson($wallpaper, $category), 201);
        } catch (\Throwable $e) {
            error_log('[AI Generation Error] ' . $e->getMessage());
            Response::error('Failed to generate AI wallpaper. Please try again.', 500, $e->getMessage());
        }
    }

    /** GET /api/ai/mine — all AI creations owned by this device, regardless of status. */
    public function mine()
    {
        $deviceId = Request::header('x-device-id');
        if (!$deviceId) {
            Response::error('Missing device identifier', 400);
        }

        $rows = WallpaperModel::findMany(['deviceId' => $deviceId], 'created_at DESC');
        $categories = CategoryModel::findByIds(array_column($rows, 'category_id'));
        $hydrated = array_map(
            fn($wp) => WallpaperModel::toJson($wp, $categories[$wp['category_id']] ?? null),
            $rows
        );

        Response::json($hydrated);
    }

    /** POST /api/ai/:id/request-public — owner asks for their private creation to be reviewed. */
    public function requestPublic(string $id)
    {
        $deviceId = Request::header('x-device-id');
        if (!$deviceId) {
            Response::error('Missing device identifier', 400);
        }

        $wallpaper = WallpaperModel::findById($id);
        if (!$wallpaper || $wallpaper['device_id'] !== $deviceId) {
            Response::error('Wallpaper not found', 404);
        }

        WallpaperModel::setApproval($id, 'public', 'pending');

        $updated = WallpaperModel::findById($id);
        $category = CategoryModel::findById($updated['category_id']);
        Response::json(WallpaperModel::toJson($updated, $category));
    }

    /** POST /api/ai/:id/make-private — owner pulls a creation back to private. */
    public function makePrivate(string $id)
    {
        $deviceId = Request::header('x-device-id');
        if (!$deviceId) {
            Response::error('Missing device identifier', 400);
        }

        $wallpaper = WallpaperModel::findById($id);
        if (!$wallpaper || $wallpaper['device_id'] !== $deviceId) {
            Response::error('Wallpaper not found', 404);
        }

        $wasPublicApproved = $wallpaper['visibility'] === 'public' && $wallpaper['approval_status'] === 'approved';
        WallpaperModel::setApproval($id, 'private', $wallpaper['approval_status']);

        if ($wasPublicApproved) {
            CategoryModel::incrementWallpaperCount($wallpaper['category_id'], -1);
        }

        $updated = WallpaperModel::findById($id);
        $category = CategoryModel::findById($updated['category_id']);
        Response::json(WallpaperModel::toJson($updated, $category));
    }

    private function downloadTo(string $url, string $destPath): bool
    {
        $fp = fopen($destPath, 'wb');
        if (!$fp) {
            return false;
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FILE => $fp,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        $ok = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fp);

        return $ok !== false && $status >= 200 && $status < 300;
    }
}
